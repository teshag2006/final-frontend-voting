'use server';

/**
 * Data Masking - Hide sensitive information based on user role
 * Prevents exposure of full transaction IDs, payment details, fraud scores, etc.
 */

export interface MaskingRule {
  pattern: RegExp;
  replacement: string;
  roles?: Array<'admin' | 'contestant' | 'media' | 'voter'>;
}

export type SensitiveDataType = 
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit_card'
  | 'transaction_id'
  | 'payment_intent'
  | 'fraud_score'
  | 'ip_address'
  | 'gateway_payload';

const maskingRules: Record<SensitiveDataType, MaskingRule> = {
  email: {
    pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: (match) => {
      const [user, domain] = match.split('@');
      const maskedUser = user.charAt(0) + '*'.repeat(user.length - 2) + user.charAt(user.length - 1);
      return `${maskedUser}@${domain}`;
    },
  },
  phone: {
    pattern: /(\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
    replacement: (match) => {
      return match.replace(/\d(?=\d{2})/g, '*');
    },
  },
  ssn: {
    pattern: /\d{3}-\d{2}-\d{4}/g,
    replacement: 'XXX-XX-XXXX',
  },
  credit_card: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: (match) => {
      return match.replace(/\d(?=\d{4})/g, '*');
    },
  },
  transaction_id: {
    pattern: /txn_[a-zA-Z0-9]{20,}/g,
    replacement: (match) => {
      return match.substring(0, 10) + '...***';
    },
  },
  payment_intent: {
    pattern: /pi_[a-zA-Z0-9]{20,}/g,
    replacement: (match) => {
      return match.substring(0, 10) + '...***';
    },
  },
  fraud_score: {
    pattern: /fraud_score[:\s]*([0-9.]+)/gi,
    replacement: '***REDACTED***',
  },
  ip_address: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: (match) => {
      const parts = match.split('.');
      return parts[0] + '.' + parts[1] + '.*.* ';
    },
  },
  gateway_payload: {
    pattern: /"(?:card|routing|account)[^"]*":\s*"[^"]*"/gi,
    replacement: '"***": "***"',
  },
};

class DataMaskingService {
  /**
   * Mask sensitive data in a string
   */
  maskData(text: string, types: SensitiveDataType[]): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let masked = text;
    types.forEach((type) => {
      const rule = maskingRules[type];
      if (rule) {
        masked = masked.replace(rule.pattern, (match) => {
          if (typeof rule.replacement === 'function') {
            return (rule.replacement as Function)(match);
          }
          return rule.replacement;
        });
      }
    });

    return masked;
  }

  /**
   * Mask sensitive data in an object based on user role
   */
  maskObjectByRole(
    obj: any,
    userRole: string,
    sensitiveFields: Record<string, SensitiveDataType[]>
  ): any {
    if (!obj) return obj;

    // Admin can see everything
    if (userRole === 'admin') {
      return obj;
    }

    // Deep clone and mask
    const masked = JSON.parse(JSON.stringify(obj));

    Object.entries(sensitiveFields).forEach(([field, types]) => {
      if (field in masked) {
        if (typeof masked[field] === 'string') {
          masked[field] = this.maskData(masked[field], types);
        }
      }
    });

    return masked;
  }

  /**
   * Create a masked version of a transaction object
   */
  maskTransaction(
    transaction: any,
    userRole: string
  ): any {
    const sensitiveFields: Record<string, SensitiveDataType[]> = {
      transaction_id: ['transaction_id'],
      payment_intent: ['payment_intent'],
      card_last_four: [],
      customer_email: ['email'],
      gateway_response: ['gateway_payload'],
      fraud_score: ['fraud_score'],
      user_ip: ['ip_address'],
    };

    return this.maskObjectByRole(transaction, userRole, sensitiveFields);
  }

  /**
   * Create a masked version of a user object
   */
  maskUser(user: any, userRole: string, targetUserRole?: string): any {
    const sensitiveFields: Record<string, SensitiveDataType[]> = {
      email: ['email'],
      phone: ['phone'],
      fraud_score: ['fraud_score'],
      gateway_customer_id: [],
      payment_methods: ['credit_card'],
      ip_history: ['ip_address'],
      last_login_ip: ['ip_address'],
    };

    // Non-admin users can only see limited info
    if (userRole !== 'admin') {
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified,
      };
    }

    return this.maskObjectByRole(user, userRole, sensitiveFields);
  }

  /**
   * Mask payment gateway webhook payload
   */
  maskWebhookPayload(payload: any): any {
    return {
      ...payload,
      data: this.maskData(JSON.stringify(payload.data || {}), [
        'credit_card',
        'email',
        'gateway_payload',
      ]),
    };
  }

  /**
   * Check if user can see sensitive field
   */
  canSeeSensitiveField(
    userRole: string,
    fieldType: SensitiveDataType,
    targetUserId?: string,
    currentUserId?: string
  ): boolean {
    // Admin can see everything
    if (userRole === 'admin') return true;

    // Users can see their own non-critical sensitive data
    if (currentUserId === targetUserId) {
      return ![
        'fraud_score',
        'gateway_payload',
        'ip_address',
        'ssn',
      ].includes(fieldType);
    }

    // Everyone else: limited access
    return ['email', 'phone'].includes(fieldType);
  }
}

export const dataMaskingService = new DataMaskingService();
