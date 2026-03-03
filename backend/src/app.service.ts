import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getStatus() {
    return {
      message: '✅ Voting System API is running',
      name: this.configService.get('APP_NAME') || 'VoteChain',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        events: '/api/v1/events',
        contestants: '/api/v1/contestants',
        votes: '/api/v1/votes',
        payments: '/api/v1/payments',
        leaderboard: '/api/v1/leaderboard',
        fraud: '/api/v1/fraud',
        blockchain: '/api/v1/blockchain',
        health: '/api/v1/health',
      },
      documentation: 'https://github.com/yourusername/voting-system/wiki',
      timestamp: new Date().toISOString(),
    };
  }
}
