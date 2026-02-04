"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

type SalonDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

type Salon = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  type: "barbershop" | "hairsalon";
  services: "male" | "female" | "both";
  credits: number;
  hairStyles?: Array<{id: string; name: string; imageUrl: string; uploadedAt: string}>;
  createdAt: string;
  updatedAt: string;
};

const MALE_PROMPTS = [
  "Classic beard trim with clean edges",
  "Low fade with textured top",
  "High fade with line up",
  "Afro styling and shaping",
  "Buzz cut with skin fade",
  "Pompadour with undercut",
  "Dreadlocks maintenance",
  "Cornrows styling",
  "Taper fade with waves",
  "Mohawk with fade sides",
];

const FEMALE_PROMPTS = [
  "Long layered haircut with face-framing",
  "Bob cut with blunt ends",
  "Pixie cut with textured layers",
  "Beach waves with highlights",
  "Sleek straight hair with middle part",
  "Curly hair with defined ringlets",
  "Balayage highlights with soft waves",
  "Blunt bangs with shoulder-length hair",
  "Updo with braided crown",
  "Ombre color with loose curls",
];

function getPresetPrompts(services: "male" | "female" | "both"): string[] {
  if (services === "male") return MALE_PROMPTS;
  if (services === "female") return FEMALE_PROMPTS;
  return [...MALE_PROMPTS, ...FEMALE_PROMPTS];
}

export default function SalonDashboardPage({ params }: SalonDashboardPageProps) {
  const [prompt, setPrompt] = useState("");
  const [slug, setSlug] = useState("");
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputMode, setInputMode] = useState<"prompt" | "library">("prompt");
  const [selectedHairStyle, setSelectedHairStyle] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{id: string; filePath: string} | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [variations, setVariations] = useState(2);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "camera">("file");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      fetchSalonData(p.slug);
    });
  }, [params]);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const response = await fetch("/api/generations");
        if (response.ok) {
          const data = await response.json();
          setGeneratedResults(data.generations || []);
        }
      } catch (err) {
        console.error("Failed to fetch generations:", err);
      }
    };

    if (session?.user?.role === "salon") {
      fetchGenerations();
    }
  }, [session]);

  useEffect(() => {
    if (stream && isCameraActive) {
      const videoElement = document.getElementById("camera-preview") as HTMLVideoElement;
      if (videoElement && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
        videoElement.play().catch(err => {
          console.error("Error playing video:", err);
          setError("Failed to display camera feed");
        });
      }
    }
  }, [stream, isCameraActive]);

  const fetchSalonData = async (salonSlug: string) => {
    try {
      const response = await fetch(`/api/salons/slug/${salonSlug}`);
      const data = await response.json();
      if (response.ok) {
        const foundSalon = data.salon as Salon | undefined;
        if (foundSalon) {
          setSalon(foundSalon);
          if (foundSalon.status === "suspended") {
            router.push("/");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch salon data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'hairstyle-preview.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('Image downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to download image');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleHistoryClick = (generation: any) => {
    setGeneratedResults([generation]);
    setUploadedImagePreview(generation.inputImagePath || uploadedImagePreview);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      console.log("[Dashboard] Uploading image:", file.name, file.type, file.size);

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[Dashboard] Upload failed:", data);
        setError(data.error || "Failed to upload image");
        setIsUploading(false);
        return;
      }

      console.log("[Dashboard] Upload successful. Image ID:", data.image.id);
      setUploadedImage({ id: data.image.id, filePath: data.image.filePath });
      setUploadedImagePreview(data.image.filePath);
      setSuccess("Image uploaded successfully!");
      setIsUploading(false);
    } catch (err) {
      console.error("[Dashboard] Upload error:", err);
      setError("An error occurred while uploading");
      setIsUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      console.log("[Camera] Stream started successfully");
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    const videoElement = document.getElementById("camera-preview") as HTMLVideoElement;
    if (!videoElement) {
      setError("Camera preview not found");
      return;
    }

    if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      setError("Camera is not ready. Please wait a moment.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        setError("Failed to create canvas context");
        return;
      }

      ctx.drawImage(videoElement, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          stopCamera();
          await handleImageUpload(file);
        } else {
          setError("Failed to capture photo");
        }
      }, "image/jpeg", 0.95);
    } catch (err) {
      setError("Error capturing photo");
      console.error("Capture error:", err);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first");
      return;
    }

    if (inputMode === "prompt" && !prompt) {
      setError("Please enter a prompt or select a hair style");
      return;
    }

    if (inputMode === "library" && !selectedHairStyle) {
      setError("Please select a hair style from the library");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const body: any = {
        inputImageId: uploadedImage.id,
        variations: variations,
      };

      if (inputMode === "library" && selectedHairStyle) {
        body.hairStyleId = selectedHairStyle;
      } else {
        body.prompt = prompt;
      }

      console.log("[Dashboard] Starting generation with body:", body);
      console.log("[Dashboard] Uploaded image ID:", uploadedImage.id);

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("[Dashboard] Generation response:", data);

      if (!response.ok) {
        if (response.status === 402) {
          setError(data.message || `Insufficient credits. You need ${data.required} credits but only have ${data.available}.`);
        } else {
          setError(data.error || "Failed to generate preview");
        }
        setIsGenerating(false);
        return;
      }

      setGeneratedResults([data.generation]);
      
      if (salon && data.credits) {
        setSalon({
          ...salon,
          credits: data.credits.remaining,
        });
        setSuccess(`Preview generated successfully! ${data.credits.used} credit(s) used. ${data.credits.remaining} remaining.`);
      } else {
        setSuccess("Preview generated successfully!");
      }
      
      setIsGenerating(false);
    } catch (err) {
      setError("An error occurred during generation");
      setIsGenerating(false);
    }
  };

  const presetPrompts = salon ? getPresetPrompts(salon.services) : [];

  if (!salon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--salon-primary)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-stone-600">Loading salon...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider salonType={salon.type}>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--salon-text)]">
              {salon.name}
            </h1>
          <p className="text-sm text-stone-600">
            {salon && (
              <>
                <span className="font-semibold text-[var(--salon-primary)]">{salon.slug}</span>
                {" • "}
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  salon.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {salon.status}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right bg-[var(--salon-primary-light)]/10 px-4 py-2 rounded-xl border-2 border-[var(--salon-primary)]/20">
            <p className="text-sm font-bold text-[var(--salon-text)]">{salon.credits}</p>
            <p className="text-xs text-[var(--salon-primary)]">credits remaining</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Client Photo</CardTitle>
            <CardDescription>
              Upload a clear photo of your client to begin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedImagePreview ? (
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-[var(--salon-primary)] shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImagePreview || undefined} alt="Uploaded" className="h-full w-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Uploaded
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedImagePreview("");
                    setGeneratedResults([]);
                  }}
                >
                  Upload Different Photo
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 p-1 bg-stone-100 rounded-lg mb-3">
                  <button
                    onClick={() => {
                      setUploadMode("file");
                      stopCamera();
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      uploadMode === "file"
                        ? "bg-white text-[var(--salon-primary)] shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setUploadMode("camera")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      uploadMode === "camera"
                        ? "bg-white text-[var(--salon-primary)] shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Take Photo
                  </button>
                </div>

                {uploadMode === "file" ? (
                  <>
                    <label
                      htmlFor="image-upload"
                      className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-[var(--salon-border)] bg-[var(--salon-primary-light)]/10 hover:bg-[var(--salon-primary-light)]/20 hover:border-[var(--salon-primary)] transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-3 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--salon-primary-light)]/20">
                          <svg
                            className="h-8 w-8 text-[var(--salon-primary)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-[var(--salon-text)]">
                            {isUploading ? "Uploading..." : "Drop photo here or click to browse"}
                          </p>
                          <p className="text-xs text-stone-600">PNG, JPG up to 10MB</p>
                        </div>
                      </div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={isUploading}
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    {isCameraActive ? (
                      <>
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-[var(--salon-primary)] bg-black">
                          <video
                            id="camera-preview"
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={stopCamera}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={capturePhoto}
                            disabled={isUploading}
                          >
                            {isUploading ? "Processing..." : "Capture Photo"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={startCamera}
                        className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-[var(--salon-border)] bg-[var(--salon-primary-light)]/10 hover:bg-[var(--salon-primary-light)]/20 hover:border-[var(--salon-primary)] transition-all duration-300"
                      >
                        <div className="space-y-3 text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--salon-primary-light)]/20">
                            <svg
                              className="h-8 w-8 text-[var(--salon-primary)]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-[var(--salon-text)]">
                              Click to start camera
                            </p>
                            <p className="text-xs text-stone-600">Take a photo directly</p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Choose Hairstyle</CardTitle>
            <CardDescription>
              {salon.type === "hairsalon" ? "Select from library or use text prompt" : "Enter a text prompt for the desired hairstyle"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {salon.type === "hairsalon" && salon.hairStyles && salon.hairStyles.length > 0 && (
              <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
                <button
                  onClick={() => setInputMode("library")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    inputMode === "library"
                      ? "bg-white text-[var(--salon-primary)] shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Hair Style Library ({salon.hairStyles.length})
                </button>
                <button
                  onClick={() => setInputMode("prompt")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    inputMode === "prompt"
                      ? "bg-white text-[var(--salon-primary)] shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Text Prompt
                </button>
              </div>
            )}

            {inputMode === "library" && salon.type === "hairsalon" && salon.hairStyles && salon.hairStyles.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium text-stone-600">Select a hair style:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                  {salon.hairStyles.map((style: any) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedHairStyle(style.id)}
                      className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedHairStyle === style.id
                          ? "border-[var(--salon-primary)] shadow-lg scale-105"
                          : "border-stone-200 hover:border-[var(--salon-primary)]/50 hover:shadow-md"
                      }`}
                    >
                      <div className="aspect-square relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {style.imageUrl && <img src={style.imageUrl} alt={style.name} className="h-full w-full object-cover" />}
                        {selectedHairStyle === style.id && (
                          <div className="absolute inset-0 bg-[var(--salon-primary)]/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-2">
                              <svg className="h-6 w-6 text-[var(--salon-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-xs font-medium text-stone-700 truncate">{style.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--salon-text)]">
                  Hairstyle Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-[var(--salon-border)] bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[var(--salon-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--salon-primary)]/20 transition-all duration-300"
                  placeholder="e.g., Short bob with bangs, platinum blonde color, layered texture"
                />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-stone-600">Quick Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {presetPrompts.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--salon-primary)] bg-[var(--salon-primary-light)]/10 hover:bg-[var(--salon-primary-light)]/20 border border-[var(--salon-border)] hover:border-[var(--salon-primary)] rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{preset}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--salon-text)]">
                Number of Variations
              </label>
              <select
                value={variations}
                onChange={(e) => setVariations(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-[var(--salon-border)] bg-white/80 backdrop-blur-sm px-4 text-sm text-stone-900 focus:border-[var(--salon-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--salon-primary)]/20 transition-all duration-300"
              >
                <option value={1}>1 variation</option>
                <option value={2}>2 variations</option>
                <option value={3}>3 variations</option>
                <option value={4}>4 variations</option>
              </select>
            </div>
            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating || !uploadedImage}
            >
              {isGenerating ? "Generating..." : "Generate Preview"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>3. Preview Results</CardTitle>
          <CardDescription>
            {generatedResults.length > 0 ? "Compare before and after" : "Results will appear here after generation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedResults.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="aspect-square w-full rounded-2xl border-2 border-[var(--salon-primary)] overflow-hidden shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {uploadedImagePreview && <img src={uploadedImagePreview} alt="Original" className="h-full w-full object-cover" />}
                  </div>
                  <p className="text-center text-sm font-semibold text-[var(--salon-text)]">Original Photo</p>
                </div>
                {generatedResults.slice(0, variations).map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-square w-full rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-lg relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {result.outputImagePath && <img src={result.outputImagePath} alt={`Generated ${index + 1}`} className="h-full w-full object-cover" />}
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        AI Generated #{index + 1}
                      </div>
                      <button
                        onClick={() => handleDownload(result.outputImagePath, `hairstyle-result-${index + 1}.jpg`)}
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-stone-700 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download this result"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-center text-sm font-semibold text-emerald-600">Result {index + 1}</p>
                    {result.generationType === "style-reference" && (
                      <p className="text-center text-xs text-stone-500">Style Transfer</p>
                    )}
                    {result.prompt && index === 0 && (
                      <p className="text-center text-xs text-stone-500 italic line-clamp-2">"{result.prompt}"</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Processing Time: {generatedResults[0].processingTime}ms</span>
                  <span>Variations: {Math.min(generatedResults.length, variations)}</span>
                  <span>Type: {generatedResults[0].generationType === "prompt" ? "Text Prompt" : "Style Reference"}</span>
                  <span>Created: {new Date(generatedResults[0].createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    setGeneratedResults([]);
                    setPrompt("");
                    setSelectedHairStyle(null);
                  }}
                >
                  Generate New
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleDownload(generatedResults[0].outputImagePath, 'hairstyle-preview.jpg')}
                >
                  Download All Results
                </Button>
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--salon-border)] bg-[var(--salon-primary-light)]/10"></div>
                <p className="text-center text-sm text-stone-400">Original</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-[var(--salon-border)] bg-[var(--mild-white-darker)]"></div>
                <p className="text-center text-sm text-stone-400">Result</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation History</CardTitle>
          <CardDescription>
            View your recent AI generations ({generatedResults.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generatedResults.length > 0 ? (
            <div className="space-y-4">
              {generatedResults.slice(0, 5).map((gen: any, index: number) => (
                <button
                  key={gen.id}
                  onClick={() => handleHistoryClick(gen)}
                  className="w-full flex items-center gap-4 border-b border-stone-100 pb-4 last:border-0 animate-slide-in hover:bg-stone-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-[var(--salon-border)] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {gen.outputImagePath && <img src={gen.outputImagePath} alt="Generated" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 space-y-1 text-left">
                    <p className="text-sm font-medium text-[var(--salon-text)]">
                      Generation #{gen.id}
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-1">
                      {gen.generationType === "prompt" 
                        ? (gen.prompt || "Text prompt generation")
                        : "Style reference generation"
                      }
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(gen.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      gen.generationType === "prompt" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {gen.generationType === "prompt" ? "Prompt" : "Style"}
                    </span>
                    <span className="text-xs text-stone-400">Click to view</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                <svg className="h-8 w-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-stone-600">No generations yet</p>
              <p className="mt-1 text-xs text-stone-500">Upload a photo and generate your first preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </ThemeProvider>
  );
}
