"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SpendingData {
  month: Date;
  total: number;
}

export function SpendingChart({ data }: { data: SpendingData[] }) {
  const chartData = data.map(item => ({
    month: format(new Date(item.month), 'MMM yyyy', { locale: de }),
    revenue: Number(item.total),
  })).reverse(); // Reverse to show oldest to newest

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Umsatzentwicklung (Letzte 12 Monate)</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-50 rounded-lg">
          Keine Umsatzdaten vorhanden.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
              tickFormatter={(value) => `€${value}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: any) => [`€${Number(value || 0).toFixed(2)}`, 'Umsatz']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4f46e5" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
