"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import {
  Button,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const getRedirectPath = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dest = params.get("redirect");
      if (dest && dest.startsWith("/")) {
        return dest;
      }
    }
    return "/";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setToastMessage("");
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const formData = new FormData(e.currentTarget);
    const remember = Boolean(formData.get("remember"));

    const errors = {};
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(errors.email || errors.password || "Please correct the highlighted validation errors.");
      return;
    }

    setIsLoading(true);
    const redirectPath = getRedirectPath();

    try {
      const { data: resdata, error } = await signIn.email({
        email: trimmedEmail,
        password,
        rememberMe: remember,
        callbackURL: redirectPath,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      setToastMessage("Login successful! Welcome back.");

      setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1000);
    } catch (err) {
      setErrorMessage(err?.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Social Sign In (Google & GitHub)
  const handleSocialSignIn = async (provider) => {
    try {
      setIsSocialLoading(true);
      setErrorMessage("");
      const redirectPath = getRedirectPath();
      await signIn.social({
        provider: provider,
        callbackURL: redirectPath,
      });
    } catch (err) {
      setErrorMessage(err?.message || `${provider} sign in failed. Please try email login.`);
      setIsSocialLoading(false);
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

      <div className="w-full max-w-md bg-[#101010] text-[#F5F1E8] rounded-3xl border border-[#262626] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative gold glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#D9A441]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#181818] border border-[#D9A441]/40 text-[#D9A441] mb-4 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-[#777777] font-sans mt-2">
            Enter your credentials to access your community account
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <Form className="flex flex-col gap-5 relative z-10" onSubmit={onSubmit} noValidate>
          {/* Email Address */}
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
                placeholder="name@example.com"
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

          {/* Password */}
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
                placeholder="Enter your password"
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
          </TextField>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#F5F1E8]/80 select-none">
              <input
                type="checkbox"
                name="remember"
                className="rounded border-[#2E2E2E] bg-[#181818] text-[#D9A441] focus:ring-[#D9A441] focus:ring-offset-0 cursor-pointer w-4 h-4 accent-[#D9A441]"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Email Submit Action */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || isSocialLoading}
              className="w-full bg-[#D9A441] hover:bg-[#C59333] text-[#101010] font-semibold text-sm py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Logging In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#262626]" />
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-[#777777]">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#262626]" />
          </div>

          {/* Social Sign In Buttons (Google & GitHub) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
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
              <span>Google Login</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialSignIn("github")}
              disabled={isLoading || isSocialLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2E2E2E] hover:border-[#777777] text-white text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Login</span>
            </button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-3 text-[11px] text-[#777777] border-t border-[#222222]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>End-to-end 256-bit SSL secured authentication</span>
          </div>
        </Form>

        {/* Footer Link to Register Page */}
        <div className="mt-8 pt-6 border-t border-[#222222] text-center text-xs text-[#777777] relative z-10">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="text-[#D9A441] hover:text-[#C59333] font-semibold hover:underline ml-1 transition-colors"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
