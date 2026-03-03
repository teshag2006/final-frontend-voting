import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudLogEntity, FraudSeverity } from '@/entities/fraud-log.entity';
import { DeviceEntity } from '@/entities/device.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { firstValueFrom } from 'rxjs';

export interface FraudAlertData {
  // Vote Information
  voteId: number;
  eventId: number;
  categoryId: number;
  contestantId: number;
  voterId?: number;
  anonymousVoterId?: string;
  
  // Fraud Detection Results
  fraudType: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  
  // Device Information
  deviceFingerprint?: string;
  deviceId?: number;
  ipAddress?: string;
  userAgent?: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  country?: string;
  city?: string;
  
  // Velocity Data
  votesInLastHour?: number;
  votesInLastDay?: number;
  timeSinceLastVote?: number;
  
  // Timestamp
  timestamp: Date;
  
  // Action Taken
  action: 'blocked' | 'flagged' | 'allowed_with_warning';
  blockedAmount?: number;
}

export interface WebhookPayload {
  alert_type: 'fraud_detected' | 'high_risk' | 'velocity_violation' | 'device_reputation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  fraud_alert: FraudAlertData;
  ai_analysis?: {
    summary: string;
    recommended_action: string;
    risk_factors: string[];
  };
}

@Injectable()
export class AlertWebhookService {
  private readonly logger = new Logger(AlertWebhookService.name);
  private readonly n8nWebhookUrl: string;
  private readonly openaiApiKey: string;
  private readonly enabled: boolean;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(FraudLogEntity)
    private fraudLogRepository: Repository<FraudLogEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
  ) {
    this.n8nWebhookUrl = this.configService.get('N8N_WEBHOOK_URL', '');
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY', '');
    this.enabled = this.configService.get('FRAUD_ALERT_WEBHOOK_ENABLED', false);
  }

  /**
   * Trigger fraud alert to n8n webhook
   * This sends the full fraud data to n8n for processing
   */
  async triggerFraudAlert(alertData: FraudAlertData): Promise<{
    sent: boolean;
    webhookResponse?: any;
    aiAnalysis?: any;
  }> {
    if (!this.enabled || !this.n8nWebhookUrl) {
      this.logger.warn('Fraud alert webhook is disabled or not configured');
      return { sent: false };
    }

    try {
      // Get AI analysis before sending
      const aiAnalysis = await this.analyzeFraudWithAI(alertData);

      // Create webhook payload
      const payload: WebhookPayload = {
        alert_type: this.getAlertType(alertData.fraudType),
        severity: alertData.riskLevel,
        timestamp: alertData.timestamp.toISOString(),
        fraud_alert: alertData,
        ai_analysis: aiAnalysis,
      };

      // Send to n8n webhook
      this.logger.log(`Sending fraud alert to n8n for vote ${alertData.voteId}`);

      const response = await firstValueFrom(
        this.httpService.post(this.n8nWebhookUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Fraud-Alert': 'true',
          },
          timeout: 10000,
        }).pipe(
          // Catch error and continue
        )
      ).catch((err) => {
        this.logger.error(`Failed to send webhook: ${err.message}`);
        return null;
      });

      // Log the alert
      await this.logFraudAlert(alertData, aiAnalysis);

      return {
        sent: true,
        webhookResponse: response?.data,
        aiAnalysis,
      };
    } catch (error: any) {
      this.logger.error(`Error triggering fraud alert: ${error.message}`);
      return { sent: false };
    }
  }

  /**
   * Analyze fraud with OpenAI
   * This uses the system logic to analyze and provide insights
   */
  async analyzeFraudWithAI(alertData: FraudAlertData): Promise<{
    summary: string;
    recommended_action: string;
    risk_factors: string[];
  }> {
    if (!this.openaiApiKey) {
      // Return basic analysis without AI
      return this.getBasicAnalysis(alertData);
    }

    try {
      const prompt = this.buildAnalysisPrompt(alertData);

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are a fraud analysis expert for a voting system. 
Analyze the fraud detection data and provide:
1. A brief summary of the suspicious activity
2. Recommended action (block, allow, investigate)
3. List of risk factors

Use the system's fraud detection logic:
- VPN/Proxy detection
- Device fingerprinting
- Velocity checks (votes per hour/day)
- Trust score calculation
- Anomaly detection patterns`
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${this.openaiApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const content = response.data.choices[0].message.content;
      
      // Parse the AI response
      return this.parseAIResponse(content);
    } catch (error: any) {
      this.logger.error(`OpenAI analysis failed: ${error.message}`);
      return this.getBasicAnalysis(alertData);
    }
  }

  /**
   * Build analysis prompt from fraud data
   */
  private buildAnalysisPrompt(data: FraudAlertData): string {
    return `
VOTE FRAUD ANALYSIS REQUEST
===========================

VOTE DETAILS:
- Vote ID: ${data.voteId}
- Event ID: ${data.eventId}
- Contestant ID: ${data.contestantId}
- Voter ID: ${data.voterId || 'Anonymous'}
- Timestamp: ${data.timestamp}

FRAUD DETECTION RESULTS:
- Fraud Type: ${data.fraudType}
- Risk Score: ${data.riskScore}/100
- Risk Level: ${data.riskLevel}
- Reasons: ${data.reasons.join(', ')}

DEVICE INFORMATION:
- Device Fingerprint: ${data.deviceFingerprint || 'Unknown'}
- IP Address: ${data.ipAddress || 'Unknown'}
- User Agent: ${data.userAgent || 'Unknown'}
- Is VPN: ${data.isVPN}
- Is Proxy: ${data.isProxy}
- Is Tor: ${data.isTor}
- Country: ${data.country || 'Unknown'}
- City: ${data.city || 'Unknown'}

VELOCITY DATA:
- Votes in Last Hour: ${data.votesInLastHour || 0}
- Votes in Last Day: ${data.votesInLastDay || 0}
- Time Since Last Vote: ${data.timeSinceLastVote || 0} seconds

ACTION TAKEN:
- Action: ${data.action}
- Blocked Amount: ${data.blockedAmount || 0}

Please analyze this data and provide your expert opinion on whether this is genuine or fraudulent activity.
`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(content: string): {
    summary: string;
    recommended_action: string;
    risk_factors: string[];
  } {
    // Simple parsing - in production, use more robust parsing
    const lines = content.split('\n').filter(l => l.trim());
    
    return {
      summary: lines.slice(0, 2).join(' ').substring(0, 200),
      recommended_action: lines.find(l => l.toLowerCase().includes('action'))?.substring(0, 100) || 'investigate',
      risk_factors: lines.filter(l => l.includes('-') || l.includes('•')).slice(0, 5),
    };
  }

  /**
   * Get basic analysis without AI
   */
  private getBasicAnalysis(data: FraudAlertData): {
    summary: string;
    recommended_action: string;
    risk_factors: string[];
  } {
    const riskFactors: string[] = [];

    if (data.isVPN) riskFactors.push('VPN/Proxy detected');
    if (data.isTor) riskFactors.push('Tor network detected');
    if ((data.votesInLastHour || 0) > 10) riskFactors.push('High velocity');
    if (data.riskScore > 80) riskFactors.push('Very high risk score');
    if (data.riskLevel === 'critical') riskFactors.push('Critical risk level');

    const action = data.riskLevel === 'critical' ? 'block' : 
                   data.riskLevel === 'high' ? 'block' : 
                   'investigate';

    return {
      summary: `${data.fraudType} detected with ${data.riskScore}% risk score. ${data.reasons.join('. ')}`,
      recommended_action: action,
      risk_factors: riskFactors,
    };
  }

  /**
   * Get alert type from fraud type
   */
  private getAlertType(fraudType: string): 'fraud_detected' | 'high_risk' | 'velocity_violation' | 'device_reputation' {
    if (fraudType.includes('velocity')) return 'velocity_violation';
    if (fraudType.includes('device')) return 'device_reputation';
    if (fraudType.includes('risk') || fraudType.includes('score')) return 'high_risk';
    return 'fraud_detected';
  }

  /**
   * Log fraud alert to database
   */
  private async logFraudAlert(data: FraudAlertData, aiAnalysis: any): Promise<void> {
    try {
      // Map riskLevel string to FraudSeverity enum
      const severityMap: Record<string, FraudSeverity> = {
        low: FraudSeverity.LOW,
        medium: FraudSeverity.MEDIUM,
        high: FraudSeverity.HIGH,
        critical: FraudSeverity.CRITICAL,
      };

      const fraudLog = this.fraudLogRepository.create({
        vote_id: data.voteId,
        event_id: data.eventId,
        fraud_type: data.fraudType,
        fraud_score: data.riskScore,
        severity: severityMap[data.riskLevel] || FraudSeverity.MEDIUM,
        description: `Alert sent to webhook. AI: ${aiAnalysis.summary}`,
        fraud_details: {
          action_taken: data.action,
          ip_address: data.ipAddress,
          device_fingerprint: data.deviceFingerprint,
          is_vpn: data.isVPN,
          is_proxy: data.isProxy,
          is_tor: data.isTor,
          reasons: data.reasons,
          ai_analysis: aiAnalysis,
        },
        device_id: data.deviceId,
        user_id: data.voterId,
      });

      await this.fraudLogRepository.save(fraudLog);
    } catch (error: any) {
      this.logger.error(`Failed to log fraud alert: ${error.message}`);
    }
  }

  /**
   * Send test alert
   */
  async sendTestAlert(): Promise<boolean> {
    const testData: FraudAlertData = {
      voteId: 999999,
      eventId: 1,
      categoryId: 1,
      contestantId: 1,
      fraudType: 'test_alert',
      riskScore: 85,
      riskLevel: 'high',
      reasons: ['Test fraud alert', 'This is a test'],
      ipAddress: '192.168.1.1',
      isVPN: true,
      isProxy: false,
      isTor: false,
      timestamp: new Date(),
      action: 'blocked',
    };

    const result = await this.triggerFraudAlert(testData);
    return result.sent;
  }
}
