"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Camera,
  CheckCircle2,
  Check,
  X,
  UploadCloud,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Password rules evaluation for live feedback
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  // Photo state (file from device or URL)
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [photoURLInput, setPhotoURLInput] = useState("");
  const [imageInputMode, setImageInputMode] = useState("file"); // "file" or "url"

  // Handle image file selection from user's device
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image file exceeds 8MB. Please choose a smaller photo.");
      return;
    }

    setErrorMessage("");
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 800; // Optimal size for avatar photo

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarPreview(dataUrl);
        setAvatarFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setAvatarFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Social Sign In / Register (Google & GitHub)
  const handleSocialRegister = async (provider) => {
    try {
      setIsSocialLoading(true);
      setErrorMessage("");
      await signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (err) {
      setErrorMessage(
        err?.message || `${provider} registration failed. Please ensure credentials are set or use email registration.`
      );
      setIsSocialLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setToastMessage("");
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Determine final photo (uploaded device photo, manual URL, or fallback)
    const finalPhoto =
      avatarPreview ||
      photoURLInput.trim() ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400";

    const errors = {};

    // 1. Name validation
    if (!trimmedName) {
      errors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }

    // 2. Email validation
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    // 3. Password validation rules per assignment:
    // - Must have an uppercase letter
    // - Must have a lowercase letter
    // - Length of at least 6 characters
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter (A-Z).";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter (a-z).";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(
        errors.password || errors.email || errors.name || "Please complete all fields properly."
      );
      return;
    }

    try {
      setIsLoading(true);

      const { data: resdata, error } = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
        image: finalPhoto,
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(error.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Show success toast/alert
      setToastMessage("Account created successfully! Welcome to UNIQUE.");

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4 sm:px-6 bg-[#FAF8F5] dark:bg-[#0F0F0F] transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-lg bg-[#101010] text-[#F5F1E8] rounded-3xl border border-[#262626] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative gold glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#D9A441]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181818] border border-[#D9A441]/40 text-[#D9A441] mb-4 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Register for UNIQUE
          </h1>
          <p className="text-sm text-[#777777] font-sans mt-2">
            Join thousands of volunteers driving real social impact
          </p>
        </div>

        {/* Social Registration Buttons (Google & GitHub) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 relative z-10">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialRegister("google")}
            disabled={isLoading || isSocialLoading}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2E2E2E] hover:border-[#777777] text-white text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Register</span>
          </button>

          {/* GitHub Button */}
          <button
            type="button"
            onClick={() => handleSocialRegister("github")}
            disabled={isLoading || isSocialLoading}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2E2E2E] hover:border-[#777777] text-white text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Register</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#262626]" />
          <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-[#777777]">
            Or with email & password
          </span>
          <div className="flex-grow border-t border-[#262626]" />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <Form className="flex flex-col gap-5 relative z-10" onSubmit={onSubmit} noValidate>
          {/* 1. Name Field */}
          <TextField
            isRequired
            name="name"
            type="text"
            className="flex flex-col gap-1.5 w-full"
          >
            <Label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#777777] pointer-events-none" />
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#181818] border text-white placeholder-[#555555] rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 ${
                  fieldErrors.name ? "border-red-500 focus:border-red-500" : "border-[#2E2E2E] focus:border-[#D9A441]"
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </TextField>

          {/* 2. Email Field */}
          <TextField
            isRequired
            name="email"
            type="email"
            className="flex flex-col gap-1.5 w-full"
          >
            <Label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
              Email Address <span className="text-red-400">*</span>
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#777777] pointer-events-none" />
              <Input
                placeholder="volunteer@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#181818] border text-white placeholder-[#555555] rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 ${
                  fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-[#2E2E2E] focus:border-[#D9A441]"
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </TextField>

          {/* 3. Photo Picker (From Device or URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
                Profile Picture (Avatar)
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageInputMode("file")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    imageInputMode === "file"
                      ? "text-[#D9A441] font-bold underline"
                      : "text-[#777777] hover:text-white"
                  }`}
                >
                  Upload File
                </button>
                <span className="text-[#444444]">|</span>
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    imageInputMode === "url"
                      ? "text-[#D9A441] font-bold underline"
                      : "text-[#777777] hover:text-white"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Mode A: Upload from Device */}
            {imageInputMode === "file" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="avatar-device-upload"
                />

                {!avatarPreview ? (
                  <label
                    htmlFor="avatar-device-upload"
                    className="flex items-center gap-3 p-3 bg-[#181818] border border-dashed border-[#2E2E2E] hover:border-[#D9A441] rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="p-2.5 rounded-lg bg-black/60 text-[#D9A441] group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white group-hover:text-[#D9A441] transition-colors">
                        Choose photo from your device
                      </span>
                      <span className="text-[10px] text-[#777777]">
                        PNG, JPG, WEBP (Auto-optimized)
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#181818] border border-[#D9A441]/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#D9A441] bg-black shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col truncate max-w-[200px]">
                        <span className="text-xs font-semibold text-white truncate">
                          {avatarFileName}
                        </span>
                        <span className="text-[10px] text-emerald-400">Photo selected</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Mode B: Direct URL input */
              <div className="relative flex items-center">
                <Camera className="absolute left-3.5 w-4 h-4 text-[#777777] pointer-events-none" />
                <input
                  type="url"
                  name="photoURL"
                  value={photoURLInput}
                  onChange={(e) => setPhotoURLInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-[#2E2E2E] focus:border-[#D9A441] text-white placeholder-[#555555] rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40"
                />
              </div>
            )}
          </div>

          {/* 4. Password Field */}
          <TextField
            isRequired
            name="password"
            type={showPassword ? "text" : "password"}
            className="flex flex-col gap-1.5 w-full"
          >
            <Label className="text-xs font-semibold uppercase tracking-wider text-[#D9A441]">
              Password <span className="text-red-400">*</span>
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#777777] pointer-events-none" />
              <Input
                placeholder="At least 6 characters, uppercase & lowercase"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`w-full pl-10 pr-11 py-3 bg-[#181818] border text-white placeholder-[#555555] rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D9A441]/40 ${
                  fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-[#2E2E2E] focus:border-[#D9A441]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#777777] hover:text-[#D9A441] focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}

            {/* Real-time Password Rules Checklist */}
            <div className="mt-2 p-3 rounded-xl bg-black/40 border border-[#262626] space-y-1.5 text-xs">
              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasMinLength ? "text-emerald-400 font-medium" : "text-[#777777]"
                }`}
              >
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#555555] shrink-0" />
                )}
                <span>At least 6 characters</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasUpperCase ? "text-emerald-400 font-medium" : "text-[#777777]"
                }`}
              >
                {hasUpperCase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#555555] shrink-0" />
                )}
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-colors ${
                  hasLowerCase ? "text-emerald-400 font-medium" : "text-[#777777]"
                }`}
              >
                {hasLowerCase ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#555555] shrink-0" />
                )}
                <span>At least one lowercase letter (a-z)</span>
              </div>
            </div>
          </TextField>

          {/* Submit Action */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || isSocialLoading}
              className="w-full bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </Button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-3 text-[11px] text-[#777777] border-t border-[#222222]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>Secure 256-bit SSL encrypted registration</span>
          </div>
        </Form>

        {/* Link to Login Page */}
        <div className="mt-8 pt-6 border-t border-[#222222] text-center text-xs text-[#777777] relative z-10">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#D9A441] hover:text-[#C59333] font-semibold hover:underline ml-1 transition-colors"
          >
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
}
