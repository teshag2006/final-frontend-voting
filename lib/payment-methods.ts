import type { PaymentMethodConfig } from '@/types/vote';

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'credit_debit_card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, American Express',
    enabled: true,
    countries: ['ALL'],
    providerUrl: 'https://checkout.stripe.com/',
  },
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    description: 'M-Pesa, Airtel Money, Orange Money',
    enabled: true,
    countries: ['ET', 'KE', 'UG', 'RW', 'TZ'],
    providerUrl: 'https://www.safaricom.co.ke/main-mpesa/m-pesa-services',
  },
  {
    id: 'chapa',
    label: 'Chapa',
    description: "Ethiopia's leading payment processor",
    enabled: true,
    countries: ['ALL'],
    providerUrl: 'https://chapa.co/',
  },
  {
    id: 'telebirr',
    label: 'Telebirr',
    description: 'Ethio Telecom mobile wallet',
    enabled: true,
    countries: ['ALL'],
    providerUrl: 'https://telebirr.et/',
  },
  {
    id: 'digital_wallet',
    label: 'PayPal',
    description: 'Secure PayPal checkout',
    enabled: true,
    countries: ['ALL'],
    providerUrl: 'https://www.paypal.com/checkoutnow',
  },
  {
    id: 'crypto',
    label: 'Crypto (Bitcoin)',
    description: 'Bitcoin or Ethereum',
    enabled: true,
    countries: ['ALL'],
    providerUrl: 'https://commerce.coinbase.com/',
  },
];
