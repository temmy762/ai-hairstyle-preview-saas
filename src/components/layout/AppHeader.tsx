"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";

type AppHeaderProps = {
  title?: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatarText = useMemo(
    () => (session?.user?.name || "").trim().slice(0, 2).toUpperCase(),
    [session?.user?.name]
  );

  const settingsHref = useMemo(
    () =>
      session?.user?.role === "admin"
        ? "/admin/settings"
        : session?.user?.role === "salon" && session?.user?.salonSlug
          ? `/salon/${session.user.salonSlug}/settings`
          : "/",
    [session?.user?.role, session?.user?.salonSlug]
  );

  const userImage = useMemo(() => session?.user?.image, [session?.user?.image]);
  const userName = useMemo(() => session?.user?.name, [session?.user?.name]);
  const userEmail = useMemo(() => session?.user?.email, [session?.user?.email]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-stone-200/50"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--crimson-600)] to-[var(--crimson-700)] shadow-lg shadow-[var(--crimson-600)]/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[var(--crimson-600)]/40 group-hover:scale-105">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--crimson-900)] group-hover:text-[var(--crimson-700)] transition-colors duration-300">
                {title ?? "StylePreview"}
              </span>
              <span className="text-xs font-medium text-stone-500 -mt-0.5">
                AI Hairstyle Platform
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          {status === "loading" ? (
            <div className="px-4 py-2 text-sm text-stone-500">Loading...</div>
          ) : session ? (
            <>
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="group relative px-4 py-2 text-sm font-medium text-stone-700 hover:text-[var(--crimson-700)] rounded-xl transition-all duration-300 hover:bg-[var(--crimson-50)]/50"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 rounded-xl bg-[var(--crimson-50)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
              {session.user?.role === "salon" && session.user?.salonSlug && (
                <Link
                  href={`/salon/${session.user.salonSlug}/dashboard`}
                  className="group relative px-4 py-2 text-sm font-medium text-stone-700 hover:text-[var(--crimson-700)] rounded-xl transition-all duration-300 hover:bg-[var(--crimson-50)]/50"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 rounded-xl bg-[var(--crimson-50)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full transition-all duration-200 hover:ring-2 hover:ring-[var(--crimson-200)] hover:ring-offset-2"
                  aria-label="User menu"
                >
                  <div className="h-9 w-9 rounded-full border border-stone-200 bg-white overflow-hidden flex items-center justify-center text-xs font-semibold text-[var(--crimson-900)]">
                    {userImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span>{avatarText || "U"}</span>
                    )}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white shadow-lg shadow-stone-200/50 overflow-hidden">
                    <div className="p-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-[var(--crimson-900)]">{userName}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{userEmail}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={settingsHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-[var(--crimson-50)] transition-colors"
                      >
                        <svg className="h-4 w-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-[var(--crimson-50)] transition-colors"
                      >
                        <svg className="h-4 w-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="group relative px-4 py-2 text-sm font-medium text-stone-700 hover:text-[var(--crimson-700)] rounded-xl transition-all duration-300 hover:bg-[var(--crimson-50)]/50"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 rounded-xl bg-[var(--crimson-50)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/signup"
                className="group relative px-4 py-2 text-sm font-medium text-white bg-[var(--crimson-600)] hover:bg-[var(--crimson-700)] rounded-xl shadow-md shadow-[var(--crimson-600)]/30 hover:shadow-lg hover:shadow-[var(--crimson-600)]/40 transition-all duration-300"
              >
                <span className="relative z-10">Sign Up</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
