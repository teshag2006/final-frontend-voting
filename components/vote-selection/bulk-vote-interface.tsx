'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Minus, X, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface VoteItem {
  contestantId: string;
  contestantName: string;
  photo_url: string;
  quantity: number;
  pricePerVote: number;
}

export interface BulkVoteCart {
  items: VoteItem[];
  totalVotes: number;
  totalPrice: number;
}

interface BulkVoteInterfaceProps {
  availablePackages: {
    quantity: number;
    price: number;
    discount?: number;
  }[];
  onVotesAdded?: (cart: BulkVoteCart) => void;
  onCheckout?: (cart: BulkVoteCart) => void;
  className?: string;
}

export function BulkVoteInterface({
  availablePackages,
  onVotesAdded,
  onCheckout,
  className,
}: BulkVoteInterfaceProps) {
  const [cart, setCart] = useState<BulkVoteCart>({
    items: [],
    totalVotes: 0,
    totalPrice: 0,
  });

  const [selectedPackage, setSelectedPackage] = useState<number>(0);

  // Add contestant to cart
  const addToCart = useCallback(
    (contestant: Omit<VoteItem, 'quantity' | 'pricePerVote'>) => {
      const package_ = availablePackages[selectedPackage];
      if (!package_) return;

      setCart((prev) => {
        const existingItem = prev.items.find((i) => i.contestantId === contestant.contestantId);
        let newItems: VoteItem[];

        if (existingItem) {
          newItems = prev.items.map((i) =>
            i.contestantId === contestant.contestantId
              ? { ...i, quantity: i.quantity + package_.quantity }
              : i
          );
        } else {
          newItems = [
            ...prev.items,
            {
              ...contestant,
              quantity: package_.quantity,
              pricePerVote: package_.price / package_.quantity,
            },
          ];
        }

        const totalVotes = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.quantity * item.pricePerVote,
          0
        );

        const newCart = { items: newItems, totalVotes, totalPrice };
        onVotesAdded?.(newCart);
        return newCart;
      });
    },
    [availablePackages, selectedPackage, onVotesAdded]
  );

  // Update item quantity
  const updateQuantity = useCallback((contestantId: string, newQuantity: number) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        return removeFromCart(contestantId, prev);
      }

      const newItems = prev.items.map((i) =>
        i.contestantId === contestantId ? { ...i, quantity: newQuantity } : i
      );

      const totalVotes = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce(
        (sum, item) => sum + item.quantity * item.pricePerVote,
        0
      );

      return { items: newItems, totalVotes, totalPrice };
    });
  }, []);

  // Remove from cart
  const removeFromCart = (contestantId: string, currentCart: BulkVoteCart) => {
    const newItems = currentCart.items.filter((i) => i.contestantId !== contestantId);
    const totalVotes = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = newItems.reduce(
      (sum, item) => sum + item.quantity * item.pricePerVote,
      0
    );

    return { items: newItems, totalVotes, totalPrice };
  };

  const handleRemove = (contestantId: string) => {
    setCart((prev) => removeFromCart(contestantId, prev));
  };

  const handleCheckout = () => {
    if (cart.items.length > 0) {
      onCheckout?.(cart);
    }
  };

  const currentPackage = availablePackages[selectedPackage];
  const discountPercentage = currentPackage?.discount || 0;
  const originalPrice = currentPackage ? currentPackage.quantity * (currentPackage.price / currentPackage.quantity / (1 - discountPercentage / 100)) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Package Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Choose Vote Package</CardTitle>
          <CardDescription>Select the number of votes you want to cast</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availablePackages.map((pkg, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPackage(idx)}
                className={cn(
                  'relative p-4 rounded-lg border-2 transition-all text-center',
                  selectedPackage === idx
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="font-bold text-lg">{pkg.quantity}</div>
                <div className="text-sm text-muted-foreground">
                  {pkg.quantity === 1 ? 'vote' : 'votes'}
                </div>
                <div className="mt-2 font-semibold text-primary">
                  ${(pkg.price / pkg.quantity).toFixed(2)} each
                </div>
                {pkg.discount && pkg.discount > 0 && (
                  <Badge className="absolute top-2 right-2" variant="destructive">
                    {pkg.discount}% off
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Voting Cart
            </CardTitle>
            <Badge variant="secondary">{cart.items.length} contestant(s)</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Select contestants to add them to your voting cart
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.contestantId} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                    {/* Contestant Image */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={item.photo_url}
                        alt={item.contestantName}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                    </div>

                    {/* Contestant Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.contestantName}</p>
                      <p className="text-xs text-muted-foreground">
                        ${(item.pricePerVote).toFixed(2)} per vote
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-background rounded border">
                      <button
                        onClick={() => updateQuantity(item.contestantId, item.quantity - 1)}
                        className="p-1 hover:bg-secondary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.contestantId, parseInt(e.target.value) || 1)
                        }
                        className="w-10 h-8 text-center border-0 p-0"
                        aria-label={`Quantity for ${item.contestantName}`}
                      />
                      <button
                        onClick={() => updateQuantity(item.contestantId, item.quantity + 1)}
                        className="p-1 hover:bg-secondary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm">
                        ${(item.quantity * item.pricePerVote).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.quantity} vote(s)</p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.contestantId)}
                      className="p-1 hover:text-destructive transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.contestantName}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Votes:</span>
                  <span className="font-semibold">{cart.totalVotes}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-primary">${cart.totalPrice.toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  size="lg"
                  className="w-full mt-4"
                  disabled={cart.items.length === 0}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Proceed to Checkout ({cart.totalVotes} vote{cart.totalVotes !== 1 ? 's' : ''})
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
