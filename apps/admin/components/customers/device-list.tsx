import { Smartphone } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function DeviceList({ devices }: { devices: any[] }) {
  if (!devices.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Registrierte Geräte</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition bg-gray-50/50">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                {device.manufacturer} {device.model}
              </h4>
              <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                {device.imei && <div><span className="font-medium text-gray-600">IMEI:</span> {device.imei}</div>}
                <div>Registriert: {format(new Date(device.createdAt), 'dd.MM.yyyy')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
