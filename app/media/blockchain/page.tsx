import { BlockchainPanel } from '@/components/media/blockchain-panel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { mockBlockchainStatus, mockAnchoredBatches } from '@/lib/media-mock';

export const metadata = {
  title: 'Blockchain Transparency | Media Dashboard',
  description: 'Blockchain verification and transparency information.',
};

export default function MediaBlockchainPage() {
  return (
      <main className="space-y-6 px-4 py-8 md:px-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Blockchain Transparency</h1>
          <p className="text-sm text-slate-400">Verify vote batches and blockchain anchoring</p>
        </div>

        {/* Blockchain Panel */}
        <section>
          <BlockchainPanel status={mockBlockchainStatus} recentBatches={mockAnchoredBatches} />
        </section>

        {/* Verification Lookup */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Verification Lookup</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter Transaction Hash, Batch ID, or Merkle Root
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x742d35Cc6634C0532925a3b844Bc73e5ebc9C5a4..."
                  className="border-slate-700 bg-slate-900 text-white"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">Verify</Button>
              </div>
            </div>

            {/* Sample Verification Result */}
            <div className="mt-6 rounded-lg border border-emerald-700/50 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-emerald-300">Verification Result: VALID</p>
                  <div className="grid grid-cols-1 gap-3 text-sm text-emerald-200">
                    <div className="space-y-1">
                      <p className="text-slate-400">Confirmations</p>
                      <p className="font-mono">256</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400">Block Number</p>
                      <p className="font-mono">18456789</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400">Timestamp</p>
                      <p className="font-mono">{new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Batch History */}
        <Card className="border-0 bg-slate-950 p-6 shadow-lg">
          <h3 className="mb-6 text-lg font-semibold text-white">Recent Anchor History</h3>

          <div className="space-y-3">
            {mockAnchoredBatches.map((batch) => (
              <div key={batch.batchId} className="flex items-start justify-between rounded-lg border border-slate-700 bg-slate-900 p-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <code className="text-sm font-mono font-semibold text-slate-300">{batch.batchId}</code>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div>
                      Block: <span className="text-slate-200">{batch.blockNumber.toLocaleString()}</span>
                    </div>
                    <div>
                      Votes: <span className="text-slate-200">{batch.voteCount.toLocaleString()}</span>
                    </div>
                    <div>
                      Status: <span className="text-emerald-400 font-medium">{batch.status}</span>
                    </div>
                    <div>
                      Date: <span className="text-slate-200">{new Date(batch.anchoredAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-700/50 bg-blue-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium">Blockchain Network Information</p>
            <p className="mt-1 text-xs text-blue-200">
              This dashboard provides transparent, read-only access to blockchain verification data. All vote batches are
              anchored to {mockBlockchainStatus.networkName} for permanent record and public verification.
            </p>
          </div>
        </div>
      </main>
  );
}
