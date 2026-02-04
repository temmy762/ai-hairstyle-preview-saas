"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (session.user.role === "salon" && session.user.salonSlug) {
        router.push(`/salon/${session.user.salonSlug}/dashboard`);
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--crimson-600)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--crimson-50)] via-white to-[var(--mild-white-darker)] opacity-60 -z-10" />
        
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center py-12 animate-fade-in">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--crimson-50)] border border-[var(--crimson-200)]">
              <svg className="h-4 w-4 text-[var(--crimson-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-[var(--crimson-700)]">For Men & Women</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-[var(--crimson-900)] leading-tight">
              Preview Hairstyles
              <span className="block text-[var(--crimson-600)]">Before You Cut</span>
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
              Upload a client photo, describe the hairstyle, and generate AI previews. Works for men's cuts, women's styles, and everything in between.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[var(--crimson-600)] hover:bg-[var(--crimson-700)] rounded-xl shadow-lg shadow-[var(--crimson-600)]/30 hover:shadow-xl hover:shadow-[var(--crimson-600)]/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started
                <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/salon/demo/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[var(--crimson-700)] bg-white hover:bg-[var(--crimson-50)] border-2 border-[var(--crimson-200)] hover:border-[var(--crimson-300)] rounded-xl transition-all duration-300"
              >
                View Demo
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>

          </div>

          <div className="relative animate-slide-in">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/hero-before-after.jpg.png"
                alt="Before and After hairstyle transformation in barbershop"
                width={1024}
                height={1024}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="animate-fade-in">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-[var(--crimson-900)]">How It Works</h2>
          <p className="text-stone-600">Three simple steps to show clients their new look</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crimson-50)] text-[var(--crimson-600)] font-bold text-xl">1</div>
            <div className="text-lg font-semibold text-stone-900">Upload Photo</div>
            <div className="text-sm text-stone-600">Take or upload a client's photo</div>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crimson-50)] text-[var(--crimson-600)] font-bold text-xl">2</div>
            <div className="text-lg font-semibold text-stone-900">Describe Style</div>
            <div className="text-sm text-stone-600">Enter the hairstyle you want to show</div>
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crimson-50)] text-[var(--crimson-600)] font-bold text-xl">3</div>
            <div className="text-lg font-semibold text-stone-900">Generate Preview</div>
            <div className="text-sm text-stone-600">AI creates realistic preview images</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12 animate-fade-in">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-[var(--crimson-900)]">
            What's Included
          </h2>
          <p className="text-lg text-stone-600">
            Simple tools for barbershops, salons, and unisex hair studios
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--crimson-50)] text-[var(--crimson-600)] mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">AI Preview Generation</h3>
            <p className="text-stone-600">Generate hairstyle previews using AI. Takes about 30 seconds per image.</p>
          </div>

          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">Photo Upload</h3>
            <p className="text-stone-600">Upload photos from your phone or camera. Supports JPG and PNG files.</p>
          </div>

          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">Style Prompts</h3>
            <p className="text-stone-600">Pre-written prompts for men's cuts, women's styles, fades, layers, and more.</p>
          </div>

          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">Session History</h3>
            <p className="text-stone-600">View your recent generations. Keep track of what you've created.</p>
          </div>

          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">Mobile Responsive</h3>
            <p className="text-stone-600">Works on desktop, tablet, and mobile devices.</p>
          </div>

          <div className="group p-8 rounded-2xl border border-stone-200 bg-white hover:border-[var(--crimson-200)] hover:shadow-xl hover:shadow-[var(--crimson-600)]/5 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--crimson-900)] mb-3">Usage Limits</h3>
            <p className="text-stone-600">Track your generation usage. Upgrade for higher limits as you need them.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--crimson-600)] to-[var(--crimson-700)] p-12 md:p-16 text-white animate-fade-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Try It Out
          </h2>
          <p className="text-xl text-white/90">
            Create an account and start generating hairstyle previews for all your clients - men, women, and everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[var(--crimson-600)] bg-white hover:bg-stone-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Create Account
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
