"use client";

import { useState } from "react";
import { Shield, Key, UserCheck, UserX, Plus } from "lucide-react";
import { createStaff, updateStaffRole, resetStaffPassword } from "../../app/actions/staff";
import { StaffRole } from "@repo/database";

export function StaffManagerClient({ initialStaff, currentUser }: { initialStaff: any[], currentUser: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("RECEPTIONIST");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createStaff({ name: newName, email: newEmail, password: newPassword, role: newRole });
    if (res.success) {
      setIsAdding(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      // Using Next router refresh implicitly via revalidatePath
    } else {
      alert("Fehler: " + res.error);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    // Find current role because action needs both
    const staff = initialStaff.find(s => s.id === id);
    const res = await updateStaffRole(id, staff.role, !currentStatus);
    if (!res.success) alert(res.error);
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: StaffRole) => {
    setLoading(true);
    const staff = initialStaff.find(s => s.id === id);
    const res = await updateStaffRole(id, newRole, staff.isActive);
    if (!res.success) alert(res.error);
    setLoading(false);
  };

  const handleResetPassword = async (id: string) => {
    const pw = prompt("Bitte neues Passwort eingeben:");
    if (!pw) return;
    setLoading(true);
    const res = await resetStaffPassword(id, pw);
    if (res.success) {
      alert("Passwort erfolgreich zurückgesetzt.");
    } else {
      alert("Fehler: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Team Übersicht</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Neuer Mitarbeiter
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold border-b pb-2">Neuen Mitarbeiter anlegen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">E-Mail (Login)</label>
              <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Passwort</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Rolle</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as StaffRole)} className="w-full border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="RECEPTIONIST">Rezeptionist (Empfang, Kasse)</option>
                <option value="TECHNICIAN">Techniker (Reparaturen)</option>
                <option value="MANAGER">Manager (Admin)</option>
                <option value="OWNER">Inhaber (Vollzugriff)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted">Abbrechen</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-lg text-sm font-medium disabled:opacity-50">Speichern</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {initialStaff.map(staff => (
          <div key={staff.id} className={`bg-card border rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-opacity ${!staff.isActive ? 'opacity-60 grayscale' : ''}`}>
            
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${staff.role === 'OWNER' ? 'bg-red-100 text-red-600' : 'bg-muted text-foreground'}`}>
                {staff.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">{staff.name} {staff.id === currentUser.id && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">Du</span>}</p>
                <p className="text-xs text-muted-foreground">{staff.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-1/3 justify-start md:justify-center">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <select 
                disabled={loading || currentUser.role !== "OWNER"}
                value={staff.role}
                onChange={e => handleRoleChange(staff.id, e.target.value as StaffRole)}
                className="text-sm border-none bg-transparent font-medium cursor-pointer focus:ring-0"
              >
                <option value="OWNER">Inhaber</option>
                <option value="MANAGER">Manager</option>
                <option value="TECHNICIAN">Techniker</option>
                <option value="RECEPTIONIST">Rezeptionist</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-1/3 justify-start md:justify-end">
              <button 
                onClick={() => handleResetPassword(staff.id)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
              >
                <Key className="w-3.5 h-3.5" /> PW Reset
              </button>
              
              {currentUser.role === "OWNER" && staff.id !== currentUser.id && (
                <button 
                  onClick={() => handleToggleStatus(staff.id, staff.isActive)}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${staff.isActive ? 'hover:bg-red-50 text-red-600 border-red-200' : 'hover:bg-green-50 text-green-600 border-green-200'}`}
                >
                  {staff.isActive ? <><UserX className="w-3.5 h-3.5" /> Sperren</> : <><UserCheck className="w-3.5 h-3.5" /> Aktivieren</>}
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
