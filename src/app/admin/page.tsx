"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Salon = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  type: "barbershop" | "hairsalon";
  services: "male" | "female" | "both";
  credits: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "active" as "active" | "suspended",
    type: "hairsalon" as "barbershop" | "hairsalon",
    services: "both" as "male" | "female" | "both",
    credits: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await fetch("/api/salons");
      const data = await response.json();
      if (response.ok) {
        setSalons(data.salons);
      }
    } catch (err) {
      console.error("Failed to fetch salons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create salon");
        return;
      }

      setShowCreateModal(false);
      setFormData({ name: "", slug: "", status: "active", type: "hairsalon", services: "both", credits: 0 });
      fetchSalons();
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleUpdateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalon) return;
    setError("");

    try {
      const response = await fetch(`/api/salons/${editingSalon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update salon");
        return;
      }

      setEditingSalon(null);
      setFormData({ name: "", slug: "", status: "active", type: "hairsalon", services: "both", credits: 0 });
      fetchSalons();
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleDeleteSalon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this salon?")) return;

    try {
      const response = await fetch(`/api/salons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSalons();
      }
    } catch (err) {
      console.error("Failed to delete salon:", err);
    }
  };

  const openEditModal = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({ name: salon.name, slug: salon.slug, status: salon.status, type: salon.type, services: salon.services, credits: salon.credits });
    setError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--crimson-600)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-stone-600">Loading salons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--crimson-900)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-stone-600">
            Manage salons and platform settings
          </p>
        </div>
        <Button onClick={() => { setShowCreateModal(true); setFormData({ name: "", slug: "", status: "active", type: "hairsalon", services: "both", credits: 0 }); setError(""); }}>
          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Salon
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600">Total Salons</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--crimson-50)]">
                  <svg className="h-4 w-4 text-[var(--crimson-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[var(--crimson-900)]">{salons.length}</p>
                <p className="text-xs text-stone-500">Registered salons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600">Active Salons</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[var(--crimson-900)]">{salons.filter(s => s.status === "active").length}</p>
                <p className="text-xs text-stone-500">Currently active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600">Suspended</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                  <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[var(--crimson-900)]">{salons.filter(s => s.status === "suspended").length}</p>
                <p className="text-xs text-stone-500">Needs attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-3">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-stone-600">Quick Links</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--crimson-50)]">
                  <svg className="h-4 w-4 text-[var(--crimson-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => {
                    setFormData({ name: "", slug: "", status: "active", type: "hairsalon", services: "both", credits: 0 });
                    setEditingSalon(null);
                    setShowCreateModal(true);
                  }}
                  className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-[var(--crimson-200)] hover:bg-[var(--crimson-50)]/30 text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--crimson-50)] text-[var(--crimson-700)]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--crimson-900)]">Create Salon</p>
                    <p className="mt-0.5 text-xs text-stone-600">Add a new salon to the platform</p>
                  </div>
                  <svg className="mt-1 h-4 w-4 text-stone-400 group-hover:text-[var(--crimson-700)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <Link
                  href="/admin/subscriptions"
                  className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-[var(--crimson-200)] hover:bg-[var(--crimson-50)]/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--crimson-900)]">Subscriptions</p>
                    <p className="mt-0.5 text-xs text-stone-600">Monitor subscription health across salons</p>
                  </div>
                  <svg className="mt-1 h-4 w-4 text-stone-400 group-hover:text-[var(--crimson-700)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/credits"
                  className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-[var(--crimson-200)] hover:bg-[var(--crimson-50)]/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V6m0 12v2m9-10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[var(--crimson-900)]">Credits</p>
                    <p className="mt-0.5 text-xs text-stone-600">Manage salon credit balances</p>
                  </div>
                  <svg className="mt-1 h-4 w-4 text-stone-400 group-hover:text-[var(--crimson-700)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salons</CardTitle>
          <CardDescription>{salons.length} total salons</CardDescription>
        </CardHeader>
        <CardContent>
          {salons.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="mt-4 text-sm font-medium text-stone-900">No salons yet</p>
              <p className="mt-1 text-xs text-stone-500">Create your first salon to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {salons.map((salon) => (
                <div
                  key={salon.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-stone-200 hover:border-[var(--crimson-200)] hover:bg-[var(--crimson-50)]/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-[var(--crimson-900)]">{salon.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        salon.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {salon.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">/salon/{salon.slug}/dashboard</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditModal(salon)}>
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteSalon(salon.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Salon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Create New Salon</CardTitle>
              <CardDescription>Add a new salon to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSalon} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
                <Input
                  label="Salon Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Slug"
                  type="text"
                  placeholder="my-salon"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Salon Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "barbershop" | "hairsalon" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="hairsalon">Hair Salon (Women's Styling)</option>
                    <option value="barbershop">Barbershop (Men's Grooming)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Services Offered</label>
                  <select
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value as "male" | "female" | "both" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="both">Both Male & Female</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
                <Input
                  label="Credits"
                  type="number"
                  value={String(formData.credits)}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "suspended" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Salon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      )}

      {/* Edit Salon Modal */}
      {editingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingSalon(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Edit Salon</CardTitle>
              <CardDescription>Update salon information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSalon} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
                <Input
                  label="Salon Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Salon Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "barbershop" | "hairsalon" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="hairsalon">Hair Salon (Women's Styling)</option>
                    <option value="barbershop">Barbershop (Men's Grooming)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Services Offered</label>
                  <select
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value as "male" | "female" | "both" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="both">Both Male & Female</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
                <Input
                  label="Credits"
                  type="number"
                  value={String(formData.credits)}
                  onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                  required
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "suspended" })}
                    className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditingSalon(null)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Update Salon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
