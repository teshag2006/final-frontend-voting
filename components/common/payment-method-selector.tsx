'use client'

import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CreditCard, Wallet, Phone } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[]
  selectedMethod: string
  onMethodChange: (methodId: string) => void
  disabled?: boolean
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onMethodChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const defaultMethods: Record<string, React.ReactNode> = {
    credit_card: <CreditCard className="h-5 w-5" />,
    wallet: <Wallet className="h-5 w-5" />,
    mobile_money: <Phone className="h-5 w-5" />,
  }

  return (
    <RadioGroup value={selectedMethod} onValueChange={onMethodChange} disabled={disabled}>
      <div className="space-y-3">
        {methods.map((method) => (
          <div key={method.id}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value={method.id} id={method.id} disabled={disabled} />
              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                <Card className="p-3 hover:bg-muted transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground">
                      {method.icon || defaultMethods[method.id]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </Card>
              </Label>
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  )
}
