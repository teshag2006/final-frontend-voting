import { HelpCircle, Mail } from 'lucide-react'

export function SupportSection() {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-6 w-6 text-gray-900 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-base text-gray-600 mb-4">
              If you have any questions about your receipt or vote, our support team is here to help.
            </p>
            <a
              href="/support"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Contact support"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
