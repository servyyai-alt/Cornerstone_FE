"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../services/auth";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useAdminFeedback } from "../../../components/admin/AdminFeedbackProvider";
import { validateLoginForm } from "../../../lib/adminValidation";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { notify } = useAdminFeedback();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const validationErrors = validateLoginForm({ username, password });

    if (validationErrors.length > 0) {
      const message = validationErrors.join(" ");
      setError(message);
      notify(message, {
        tone: "error",
        title: "Check your login details",
      });
      return;
    }

    setLoading(true);

    try {
      await login(username, password);

      notify("Signed in successfully.", {
        tone: "success",
        title: "Welcome back",
      });

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        "Login failed. Please check credentials.";

      setError(message);

      notify(message, {
        tone: "error",
        title: "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-surface p-8 shadow-lg">
        <div className="text-center">
          <span
            aria-hidden="true"
            className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface-2 font-display text-2xl font-bold text-primary"
          >
            C
          </span>

          <h1 className="font-display text-2xl font-semibold">
            CMS Portal
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Sign in to manage website pages and leads
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-500"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Username
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-muted-foreground" />
              </span>

              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                aria-invalid={Boolean(error)}
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Password
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={Boolean(error)}
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-11 text-sm focus:border-primary focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;