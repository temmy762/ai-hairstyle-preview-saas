"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--crimson-900)]">Subscriptions</h1>
          <p className="text-sm text-stone-600">Monitor subscription status across salons</p>
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
          <CardTitle>Overview</CardTitle>
          <CardDescription>Subscription monitoring (UI placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-stone-600">
            This page is wired with a working route and navigation. To make it fully functional, we’ll connect it to your
            billing provider/webhooks and persist subscription state per salon.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <p className="text-sm font-medium text-stone-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-[var(--crimson-900)]">—</p>
            </div>
            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <p className="text-sm font-medium text-stone-600">Past Due</p>
              <p className="text-2xl font-bold text-[var(--crimson-900)]">—</p>
            </div>
            <div className="p-4 rounded-xl border border-stone-200 bg-white">
              <p className="text-sm font-medium text-stone-600">Canceled</p>
              <p className="text-2xl font-bold text-[var(--crimson-900)]">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
