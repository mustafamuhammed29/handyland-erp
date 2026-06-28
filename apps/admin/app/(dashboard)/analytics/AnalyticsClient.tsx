"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Wrench, Banknote, Users, UserPlus } from 'lucide-react';
import { AnimatedCounter } from "../../../components/dashboard/AnimatedCounter";

const COLORS = ['#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12'];

interface AnalyticsClientProps {
  kpis: {
    repairsThisMonth: number;
    revenueThisMonth: number;
    newCustomers: number;
    returningCustomers: number;
  };
  repairsPerDay: { name: string; Repairs: number }[];
  issuesData: { name: string; value: number }[];
  revenueTrend: { name: string; Revenue: number }[];
}

export default function AnalyticsClient({ kpis, repairsPerDay, issuesData, revenueTrend }: AnalyticsClientProps) {
  
  const stats = [
    { name: 'Repairs (This Month)', value: kpis.repairsThisMonth.toString(), icon: Wrench },
    { name: 'Revenue (This Month)', value: `€${kpis.revenueThisMonth.toFixed(2)}`, icon: Banknote },
    { name: 'New Customers', value: kpis.newCustomers.toString(), icon: UserPlus },
    { name: 'Returning Customers', value: kpis.returningCustomers.toString(), icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.name}</span>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                <AnimatedCounter value={stat.value} isCurrency={stat.name.includes('Revenue')} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Repairs per day */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Repairs per Day (Last 7 Days)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Repairs" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Monthly Revenue */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Revenue Trend (Last 6 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `€${val}`} />
                <Tooltip cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: any) => [`€${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="Revenue" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Top Issues */}
        <div className="bg-card border rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col items-center">
          <h2 className="text-lg font-semibold w-full text-left mb-2">Most Common Repair Issues</h2>
          {issuesData.length > 0 ? (
            <div className="h-[300px] w-full max-w-lg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issuesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {issuesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 w-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed mt-4">
              Not enough data for issues
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
