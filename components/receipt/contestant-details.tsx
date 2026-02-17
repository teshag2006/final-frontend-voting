'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { ReceiptData } from '@/types/receipt'

interface ContestantDetailsProps {
  receipt: ReceiptData
}

export function ContestantDetails({ receipt }: ContestantDetailsProps) {
  const { contestant, category, event } = receipt

  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg">
      <div className="space-y-6">
        {/* Contestant Profile */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative h-40 w-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={contestant.profileImageUrl}
              alt={`${contestant.firstName} ${contestant.lastName}`}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {contestant.firstName} {contestant.lastName}
              </h3>
              {contestant.verified && (
                <div
                  className="flex-shrink-0 bg-green-100 rounded-full p-1"
                  aria-label="Verified contestant"
                  title="Verified contestant"
                >
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-gray-600">
              <p className="text-base md:text-lg">
                <span className="font-semibold text-gray-900">Category:</span>{' '}
                {category.name}
              </p>
              <p className="text-base md:text-lg">
                <span className="font-semibold text-gray-900">Event:</span>{' '}
                {event.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
