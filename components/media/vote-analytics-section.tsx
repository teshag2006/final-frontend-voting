'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface VoteAnalyticsSectionProps {
  trendData: any[];
  categoryData: any[];
}

const COLORS = ['#3b82f6', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

export function VoteAnalyticsSection({ trendData, categoryData }: VoteAnalyticsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Vote Analytics</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Votes Over Time */}
        <Card className="p-4 border-0 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Votes Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#e5e7eb"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#e5e7eb"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="votes" 
                stroke="#3b82f6" 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Votes by Category */}
        <Card className="p-4 border-0 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Votes by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
