'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PaymentProvider } from '@/types/media';
import { Card } from '@/components/ui/card';

interface PaymentBreakdownProps {
  data: PaymentProvider[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
  const chartData = data.map((provider) => ({
    name: provider.name,
    value: provider.percentage,
    amount: provider.completedAmount,
  }));

  return (
    <Card className="border-0 bg-slate-950 p-6 shadow-lg">
      <h3 className="mb-6 text-lg font-semibold text-white">Payment Provider Breakdown</h3>

      <div className="flex flex-col items-center gap-6 lg:flex-row">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3 lg:w-auto">
          {data.map((provider, idx) => (
            <div key={provider.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-white">{provider.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-400">{provider.percentage}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  Completed: <span className="text-emerald-400">${provider.completedAmount.toLocaleString()}</span>
                </div>
                <div>
                  Failed: <span className="text-red-400">{provider.failedCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
