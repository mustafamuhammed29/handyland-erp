import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Wrench, CheckCircle, Clock } from "lucide-react";

export function RepairHistory({ repairs }: { repairs: any[] }) {
  if (!repairs.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-gray-500">
        Noch keine Reparaturen für diesen Kunden.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Reparatur-Historie</h3>
      <div className="space-y-6">
        {repairs.map((repair, index) => {
          const isCompleted = repair.status === "DELIVERED";
          return (
            <div key={repair.id} className="relative pl-6 pb-6 border-l-2 border-gray-100 last:border-0 last:pb-0">
              <div className={`absolute -left-3 top-0 p-1 rounded-full bg-white border-2 ${isCompleted ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 -mt-1">
                <div>
                  <Link href={`/repairs/${repair.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition">
                    Ticket {repair.ticketNumber}
                  </Link>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {repair.device?.manufacturer} {repair.device?.model}
                  </p>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    {repair.issues?.map((issue: any) => (
                      <div key={issue.id} className="flex items-center gap-2">
                        <Wrench className="w-3 h-3" /> {issue.issueType}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {repair.finalPrice ? `€${Number(repair.finalPrice).toFixed(2)}` : repair.estimatedPrice ? `~ €${Number(repair.estimatedPrice).toFixed(2)}` : "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(repair.createdAt), 'dd. MMM yyyy', { locale: de })}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {repair.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
