"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type SettingsPageProps = {
  params: Promise<{ slug: string }>;
};

export default function SettingsPage({ params }: SettingsPageProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const hasInitialized = useRef(false);
  const [slug, setSlug] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [salonServices, setSalonServices] = useState<"male" | "female" | "both">("both");
  const [salonType, setSalonType] = useState<"barbershop" | "hairsalon">("hairsalon");
  const [hairStyles, setHairStyles] = useState<Array<{id: string; name: string; imageUrl: string; uploadedAt: string}>>([])
  const [hairStyleName, setHairStyleName] = useState("");
  const [hairStyleFile, setHairStyleFile] = useState<File | null>(null);
  const [hairStylePreview, setHairStylePreview] = useState("");
  const hairStyleInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salonSuccess, setSalonSuccess] = useState("");
  const [hairStyleSuccess, setHairStyleSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (session?.user && !hasInitialized.current) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImage(session.user.image || "");
      setImagePreview(session.user.image || "");
      hasInitialized.current = true;
    }
  }, [session]);

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!slug) return;
      try {
        const response = await fetch(`/api/salons/slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setSalonType(data.salon.type);
          setSalonServices(data.salon.services);
          setHairStyles(data.salon.hairStyles?.map((hs: any) => ({
            ...hs,
            uploadedAt: new Date(hs.uploadedAt).toISOString()
          })) || []);
        }
      } catch (err) {
        console.error("Failed to fetch salon data:", err);
      }
    };
    fetchSalonData();
  }, [slug]);

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageChange(file);
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      let imageUrl = image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          setError(uploadData.error || "Failed to upload image");
          setIsLoading(false);
          return;
        }

        imageUrl = uploadData.url;
      }

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image: imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      await update({ name, email, image: imageUrl });
      setImage(imageUrl);
      setImageFile(null);
      setSuccess("Profile updated successfully");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  const handleSalonSettingsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSalonSuccess("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/salon/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: salonServices }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update salon settings");
        setIsLoading(false);
        return;
      }

      setSalonSuccess("Salon settings updated successfully");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to change password");
        setIsLoading(false);
        return;
      }

      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  const handleHairStyleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setHairStyleFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHairStylePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHairStyleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!hairStyleName || !hairStyleFile) {
      setError("Please provide a name and select an image");
      return;
    }

    setIsLoading(true);
    setError("");
    setHairStyleSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", hairStyleName);
      formData.append("image", hairStyleFile);

      const response = await fetch("/api/salon/hairstyles", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload hair style");
        setIsLoading(false);
        return;
      }

      setHairStyleSuccess("Hair style uploaded successfully");
      setHairStyles([...hairStyles, data.hairStyle]);
      setHairStyleName("");
      setHairStyleFile(null);
      setHairStylePreview("");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  const handleDeleteHairStyle = async (hairStyleId: string) => {
    if (!confirm("Are you sure you want to delete this hair style?")) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/salon/hairstyles?id=${hairStyleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete hair style");
        setIsLoading(false);
        return;
      }

      setHairStyles(hairStyles.filter((hs) => hs.id !== hairStyleId));
      setHairStyleSuccess("Hair style deleted successfully");
      setIsLoading(false);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--crimson-900)]">
          Settings
        </h1>
        <p className="text-sm text-stone-600">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input
                label="Salon Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Profile Image</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer ${
                    isDragging
                      ? "border-[var(--crimson-600)] bg-[var(--crimson-50)]"
                      : "border-stone-300 hover:border-[var(--crimson-400)] hover:bg-stone-50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <p className="text-xs text-stone-600">Click or drag to change</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crimson-50)]">
                        <svg className="h-6 w-6 text-[var(--crimson-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-stone-700">Upload profile picture</p>
                        <p className="text-xs text-stone-500 mt-1">Drag and drop or click to browse</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {salonSuccess && (
        <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
          {salonSuccess}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Salon Settings</CardTitle>
          <CardDescription>Configure your salon's service offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalonSettingsUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Services Offered</label>
              <select
                value={salonServices}
                onChange={(e) => setSalonServices(e.target.value as "male" | "female" | "both")}
                className="w-full h-11 rounded-xl border border-[var(--mild-white-border)] bg-white px-4 text-sm focus:border-[var(--crimson-600)] focus:outline-none focus:ring-2 focus:ring-[var(--crimson-600)]/20"
              >
                <option value="both">Both Male & Female</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
              <p className="text-xs text-stone-500 mt-1">
                This determines which AI prompts and styling options are available to your salon
              </p>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Salon Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {salonType === "hairsalon" && (
        <>
          {hairStyleSuccess && (
            <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
              {hairStyleSuccess}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Hair Style Library</CardTitle>
              <CardDescription>Upload hair style samples for clients to try on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleHairStyleUpload} className="space-y-4">
                <Input
                  label="Style Name"
                  type="text"
                  placeholder="e.g., Classic Bob, Beach Waves"
                  value={hairStyleName}
                  onChange={(e) => setHairStyleName(e.target.value)}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Hair Style Image</label>
                  <div
                    onClick={() => hairStyleInputRef.current?.click()}
                    className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 hover:border-[var(--salon-primary,var(--crimson-400))] p-6 transition-all cursor-pointer"
                  >
                    {hairStylePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-stone-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={hairStylePreview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                        <p className="text-xs text-stone-600">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--salon-primary-light,var(--crimson-50))]/10">
                          <svg className="h-6 w-6 text-[var(--salon-primary,var(--crimson-600))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-stone-700">Upload hair style image</p>
                          <p className="text-xs text-stone-500 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </>
                    )}
                    <input
                      ref={hairStyleInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHairStyleFileChange(file);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading || !hairStyleName || !hairStyleFile}>
                  {isLoading ? "Uploading..." : "Add Hair Style"}
                </Button>
              </form>

              {hairStyles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-stone-700">Uploaded Styles ({hairStyles.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {hairStyles.map((style) => (
                      <div key={style.id} className="group relative rounded-xl border border-[var(--salon-border,var(--mild-white-border))] overflow-hidden hover:shadow-lg transition-all">
                        <div className="aspect-square relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={style.imageUrl} alt={style.name} className="h-full w-full object-cover" />
                          <button
                            onClick={() => handleDeleteHairStyle(style.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            disabled={isLoading}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs font-medium text-stone-700 truncate">{style.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
