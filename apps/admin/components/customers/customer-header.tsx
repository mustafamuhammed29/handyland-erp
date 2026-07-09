import { LoyaltyBadge } from "../../ui/loyalty-badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, Phone, Edit2 } from "lucide-react";
import Link from "next/link";

export function CustomerHeader({ customer }: { customer: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
            {customer.firstName?.[0]}{customer.lastName?.[0]}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 text-sm">
              <span className="text-gray-600 font-medium">{customer.phone}</span>
              {customer.email && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{customer.email}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <LoyaltyBadge tier={customer.loyaltyTier} />
              <span className="text-sm text-gray-500">
                Kunde seit {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: de })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {customer.email && (
            <a href={`mailto:${customer.email}`} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> E-Mail
            </a>
          )}
          <a href={`tel:${customer.phone}`} className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <Phone className="w-4 h-4" /> Anrufen
          </a>
          <button className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
}
