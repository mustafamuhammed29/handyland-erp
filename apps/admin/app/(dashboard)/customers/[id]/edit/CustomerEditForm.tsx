"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer } from "../../../../actions/customer";
import Link from "next/link";

export function CustomerEditForm({ customer }: { customer: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    phone: customer.phone || "",
    email: customer.email || "",
    street: customer.street || "",
    city: customer.city || "",
    postalCode: customer.postalCode || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateCustomer(customer.id, formData);
      if (res.success) {
        router.push("/customers");
        router.refresh();
      } else {
        alert("Fehler beim Speichern: " + res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">Vorname</label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">Nachname</label>
          <input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Telefon</label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">E-Mail</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="street" className="text-sm font-medium">Straße</label>
          <input
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">Stadt</label>
          <input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="postalCode" className="text-sm font-medium">PLZ</label>
          <input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Link
          href="/customers"
          className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Abbrechen
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
        >
          {isPending ? "Speichern..." : "Speichern"}
        </button>
      </div>
    </form>
  );
}
