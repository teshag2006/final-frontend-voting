'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface PricingCalculatorProps {
  pricePerVote: number
  basePrice?: number
  discountTiers?: Array<{ votes: number; discount: number }>
  onCalculate?: (votes: number, totalPrice: number, discount: number) => void
}

export function PricingCalculator({
  pricePerVote,
  basePrice = 0,
  discountTiers = [
    { votes: 100, discount: 5 },
    { votes: 500, discount: 10 },
    { votes: 1000, discount: 15 },
  ],
  onCalculate,
}: PricingCalculatorProps) {
  const [votes, setVotes] = useState(0)

  const subtotal = votes * pricePerVote
  const applicableDiscount = discountTiers.find((t) => votes >= t.votes)?.discount || 0
  const discountAmount = (subtotal * applicableDiscount) / 100
  const totalPrice = basePrice + subtotal - discountAmount

  const handleVotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setVotes(Math.max(0, value))
    onCalculate?.(value, totalPrice, applicableDiscount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Calculator</CardTitle>
        <CardDescription>Calculate the cost of your votes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="votes">Number of Votes</Label>
          <Input
            id="votes"
            type="number"
            min="0"
            value={votes}
            onChange={handleVotesChange}
            placeholder="Enter number of votes"
          />
        </div>

        {/* Discount Tiers */}
        {discountTiers.length > 0 && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-medium">Discount Tiers</p>
            <div className="grid gap-2">
              {discountTiers.map((tier) => (
                <div key={tier.votes} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tier.votes}+ votes</span>
                  <Badge variant={votes >= tier.votes ? 'default' : 'outline'}>
                    {tier.discount}% off
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {applicableDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Discount ({applicableDiscount}%)</span>
              <span className="text-green-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {basePrice > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Fee</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t font-semibold">
            <span>Total</span>
            <span className="text-lg">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Per Vote Breakdown */}
        {votes > 0 && (
          <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
            <span>${(totalPrice / votes).toFixed(2)} per vote</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
