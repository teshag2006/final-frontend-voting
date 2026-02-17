import { Shield } from 'lucide-react'

export function TransparencyMessage() {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Transparency & Security
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            Your vote has been securely recorded and processed through our fraud detection 
            and verification system. All votes are protected by industry-standard encryption 
            and blockchain verification for complete transparency.
          </p>
        </div>
      </div>
    </div>
  )
}
