"use client";

import { useState } from "react";
import { addCustomerNote } from "../../app/actions/customer-notes";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Send, UserCircle } from "lucide-react";

export function CustomerNotes({ customerId, notes }: { customerId: string, notes: any[] }) {
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setLoading(true);
    try {
      const res = await addCustomerNote(customerId, newNote);
      if (res.success) {
        setNewNote("");
      } else {
        alert("Fehler beim Hinzufügen der Notiz: " + res.error);
      }
    } catch (error) {
      alert("Fehler beim Hinzufügen der Notiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col h-[600px]">
      <h3 className="text-lg font-bold text-gray-900 mb-6 shrink-0">Interne Notizen</h3>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {notes.length === 0 ? (
          <div className="text-center text-gray-500 my-10">
            Noch keine Notizen vorhanden.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-sm text-gray-700">{note.staff?.name || 'Mitarbeiter'}</span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: de })}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.note}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 relative">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Neue Notiz hinzufügen..."
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition shadow-sm"
          rows={3}
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newNote.trim()}
          className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
