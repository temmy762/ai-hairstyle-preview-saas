"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminCreditsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--crimson-900)]">Credits</h1>
          <p className="text-sm text-stone-600">Manage salon credits</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)] focus:ring-offset-2 h-11 px-5 text-sm rounded-xl bg-[var(--mild-white-darker)] text-[var(--crimson-900)] hover:bg-[var(--crimson-50)] border border-[var(--mild-white-border)] hover:border-[var(--crimson-200)]"
        >
          Back to Admin
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to manage credits</CardTitle>
          <CardDescription>Credits are stored per salon and can be updated from the Salon edit modal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-stone-600">
            Go to the Admin dashboard, click Edit on a salon, and set its credits value.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)] focus:ring-offset-2 h-11 px-5 text-sm rounded-xl bg-[var(--crimson-600)] text-white hover:bg-[var(--crimson-700)] hover:shadow-lg hover:shadow-[var(--crimson-600)]/20 active:scale-[0.98]"
          >
            Go to Salon Management
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
