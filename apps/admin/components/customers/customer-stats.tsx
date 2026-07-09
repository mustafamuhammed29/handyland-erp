import { Banknote, Wrench, Star, ShieldCheck, MailCheck } from "lucide-react";

export function CustomerStats({ customer }: { customer: any }) {
  const stats = [
    {
      label: "Gesamtumsatz",
      value: `€${Number(customer.totalSpending).toFixed(2)}`,
      icon: Banknote,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      label: "Reparaturen",
      value: customer.totalRepairs,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      label: "Treuepunkte",
      value: customer.loyaltyPoints,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      label: "Datenschutz (DSGVO)",
      value: customer.gdprConsent ? "Zustimmung erteilt" : "Fehlt",
      icon: ShieldCheck,
      color: customer.gdprConsent ? "text-indigo-600" : "text-gray-400",
      bg: customer.gdprConsent ? "bg-indigo-100" : "bg-gray-100"
    },
    {
      label: "Marketing",
      value: customer.marketingConsent ? "Aktiv" : "Inaktiv",
      icon: MailCheck,
      color: customer.marketingConsent ? "text-purple-600" : "text-gray-400",
      bg: customer.marketingConsent ? "bg-purple-100" : "bg-gray-100"
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Übersicht</h3>
      <div className="space-y-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
            </div>
            <span className="font-bold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
