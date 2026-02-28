"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBrandGoogleFilled, IconBrandWindows } from "@tabler/icons-react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import Auth from "@/lib/auth/auth";
import { supabase } from "@/lib/subabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await Auth.signUp({
        display_name: name,
        email,
        password,
      });

      setDialogMessage(
        error
          ? error.message
          : "Account created. Check your email for a confirmation link."
      );
      setDialogOpen(true);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setDialogMessage(error.message);
      setDialogOpen(true);
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  }, [email, name, password, mode, router]);

  const handleOAuthLogin = useCallback(async (provider: "google" | "azure") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setDialogMessage(error.message);
      setDialogOpen(true);
    }
    setLoading(false);
  }, []);

  const handleForgotPasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setDialogMessage("Please enter your email to reset your password.");
      setDialogOpen(true);
      return;
    }

    setLoading(true);
    await Auth.handleForgotPassword(email);
    setDialogMessage("Check your email for a password reset link.");
    setDialogOpen(true);
    setLoading(false);
  }, [email]);

  return (
    <div className={cn("w-full", className)} {...props}>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notice</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mode === "login" ? (
        <form onSubmit={handleAuth} className="space-y-3" autoComplete="off">
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
            Welcome Back
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Sign in to manage drives, candidates, staff, and client programs.
          </p>

          <div className="space-y-1.5 pt-0.5">
            <Label htmlFor="email" className="text-[11px] font-bold text-foreground">
              Email Address
            </Label>
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/45 px-2.5 py-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-auto border-0 bg-transparent p-0 text-xs text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[11px] font-bold text-foreground">
              Password
            </Label>
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/45 px-2.5 py-1.5">
              <Lock className="size-3.5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                placeholder="Enter your secure password"
                onChange={(e) => setPassword(e.target.value)}
                className="h-auto border-0 bg-transparent p-0 text-xs text-foreground shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px]">
            <label className="inline-flex items-center gap-1.5 text-foreground">
              <input
                type="checkbox"
                className="size-3.5 rounded border border-border bg-background accent-primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me for 30 days
            </label>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="font-semibold text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign In to Dashboard
            <ArrowRight className="size-3.5" />
          </button>

          <div className="border-t border-border pt-2.5">
            <p className="mb-2.5 text-center text-[11px] text-muted-foreground">
              Alternate sign-in options
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                type="button"
                className="h-8 w-full justify-center gap-1.5 text-xs"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
              >
                <IconBrandGoogleFilled className="size-3.5" />
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="h-8 w-full justify-center gap-1.5 text-xs"
                onClick={() => handleOAuthLogin("azure")}
                disabled={loading}
              >
                <IconBrandWindows className="size-3.5" />
                Microsoft
              </Button>
            </div>
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode("signup")}
              >
                Create one
              </button>
            </p>
          </div>
        </form>
      ) : null}

      {mode === "signup" ? (
        <form
          onSubmit={handleAuth}
          className="mx-auto w-full max-w-md space-y-3"
          autoComplete="off"
        >
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Set up your DriveMS workspace access.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            Create Account
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode("login")}
            >
              Back to Login
            </button>
          </p>
        </form>
      ) : null}

      {mode === "forgot" ? (
        <form
          onSubmit={handleForgotPasswordSubmit}
          className="mx-auto w-full max-w-md space-y-3"
          autoComplete="off"
        >
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="email-forgot">Email</Label>
            <Input
              id="email-forgot"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            Send Reset Link
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setMode("login")}
            >
              Back to Login
            </button>
          </p>
        </form>
      ) : null}
    </div>
  );
}
