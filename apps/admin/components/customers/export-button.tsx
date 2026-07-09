"use client";

import { exportCustomersToCSV } from "../../app/actions/export-customers";
import { Download } from "lucide-react";
import { useState } from "react";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = await exportCustomersToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kunden_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Fehler beim Exportieren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 bg-white border shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {loading ? "Exportiert..." : "CSV Exportieren"}
    </button>
  );
}
