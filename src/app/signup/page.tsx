"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role = "salon";
  const [salonSlug, setSalonSlug] = useState("");
  const [salonType, setSalonType] = useState<"barbershop" | "hairsalon">("hairsalon");
  const [salonServices, setSalonServices] = useState<"male" | "female" | "both">("both");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!salonSlug) {
      setError("Salon slug is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          salonSlug,
          salonType,
          salonServices,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please try logging in manually.");
        setIsLoading(false);
        return;
      }

      router.push(`/salon/${salonSlug}/dashboard`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center animate-fade-in py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--crimson-900)]">
            Create Account
          </h1>
          <p className="text-sm text-stone-600">
            Get started with StylePreview
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Salon Name"
                type="text"
                placeholder="Your Salon Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Salon Slug"
                type="text"
                placeholder="my-salon (used in URL)"
                value={salonSlug}
                onChange={(e) => setSalonSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Salon Type</label>
                <select
                  value={salonType}
                  onChange={(e) => setSalonType(e.target.value as "barbershop" | "hairsalon")}
                  className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  required
                >
                  <option value="hairsalon">Hair Salon (Women's Styling)</option>
                  <option value="barbershop">Barbershop (Men's Grooming)</option>
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  {salonType === "hairsalon" 
                    ? "Pink/purple theme with feminine styling focus" 
                    : "Black/blue theme with masculine grooming focus"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Services Offered</label>
                <select
                  value={salonServices}
                  onChange={(e) => setSalonServices(e.target.value as "male" | "female" | "both")}
                  className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
                  required
                >
                  <option value="both">Both Male & Female</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@salon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[var(--crimson-700)] hover:text-[var(--crimson-600)] transition-colors">
              Sign in
            </Link>
          </p>
          <Link href="/" className="block text-sm text-stone-600 hover:text-[var(--crimson-700)] transition-colors duration-300">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
