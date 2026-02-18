// @ts-nocheck
'use client';

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlanCard } from '@/components/common/plan-card'
import { QuotaProgress } from '@/components/common/quota-progress'
import { PaymentMethodSelector } from '@/components/common/payment-method-selector'
import { PricingCalculator } from '@/components/common/pricing-calculator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Calendar, CreditCard } from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: Array<{ name: string; included: boolean }>
}

interface SubscriptionManagementPageProps {
  plans: Plan[]
  currentPlanId?: string
  dailyVotesUsed?: number
  dailyVotesLimit?: number
  paymentMethods?: Array<{ id: string; name: string; description: string; icon?: React.ReactNode }>
  onPlanChange: (planId: string) => Promise<void>
  onPaymentMethodChange: (methodId: string) => void
}

const DEFAULT_PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', description: 'Visa, Mastercard, American Express' },
  { id: 'wallet', name: 'Digital Wallet', description: 'Apple Pay, Google Pay' },
  { id: 'mobile_money', name: 'Mobile Money', description: 'M-Pesa, AirtelMoney' },
]

export function SubscriptionManagementPage({
  plans,
  currentPlanId,
  dailyVotesUsed = 5,
  dailyVotesLimit = 10,
  paymentMethods = DEFAULT_PAYMENT_METHODS,
  onPlanChange,
  onPaymentMethodChange,
}: SubscriptionManagementPageProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [planChangeInProgress, setPlanChangeInProgress] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    setPlanChangeInProgress(planId)
    try {
      await onPlanChange(planId)
    } finally {
      setPlanChangeInProgress(null)
    }
  }

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    onPaymentMethodChange(methodId)
  }

  const currentPlan = plans.find((p) => p.id === currentPlanId)

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {currentPlan && (
        <Card className="border-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Current Subscription</CardTitle>
                <CardDescription>Manage your voting plan and quota</CardDescription>
              </div>
              <Badge className="bg-accent text-accent-foreground">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold">{currentPlan.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold">${currentPlan.price}/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="text-2xl font-bold">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Quota Progress */}
      <QuotaProgress
        used={dailyVotesUsed}
        total={dailyVotesLimit}
        label="Daily Votes"
        showResetDate="tomorrow at midnight"
        isWarning={true}
      />

      {/* Plan Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              period="month"
              features={plan.features}
              isCurrentPlan={currentPlanId === plan.id}
              onSelect={() => handlePlanSelect(plan.id)}
              disabled={planChangeInProgress !== null}
              badge={plan.price === 0 ? 'Free' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Payment Settings</h2>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Select how you want to pay for your votes</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodSelector
              methods={paymentMethods}
              selectedMethod={selectedPaymentMethod}
              onMethodChange={handlePaymentMethodChange}
            />
          </CardContent>
        </Card>

        {/* Pricing Calculator */}
        <PricingCalculator
          pricePerVote={0.01}
          basePrice={currentPlan?.price || 0}
          discountTiers={[
            { votes: 100, discount: 5 },
            { votes: 500, discount: 10 },
            { votes: 1000, discount: 15 },
          ]}
        />

        {/* Payment Methods Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your payment method is securely stored and encrypted. You can update or add new payment methods anytime.
          </AlertDescription>
        </Alert>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your recent invoices and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">Monthly Subscription</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${currentPlan?.price}</p>
                  <Badge variant="outline">Paid</Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Invoices
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


