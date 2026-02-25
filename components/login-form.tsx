"use client";
import { useState } from "react";
import { supabase } from "@/lib/subabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconBrandGoogleFilled, IconBrandWindows } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Auth from "@/lib/auth/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Dialog state for any feedback (success or error)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const router = useRouter();

  // AUTH SUBMITS
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Signup
    if (mode === "signup") {
      const { data, error: supaError } = await Auth.signUp({
        display_name: name,
        email,
        password,
      });

      console.log(data);

      if (supaError) {
        setDialogMessage(supaError.message);
      } else {
        setDialogMessage(
          "Account created! Please check your email for a confirmation link."
        );
      }
      setDialogOpen(true);
    }
    // Login
    else if (mode === "login") {
      const { error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supaError) {
        setDialogMessage(supaError.message);
        setDialogOpen(true);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  // OAUTH
  const handleOAuthLogin = async (provider: "google" | "azure") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setDialogMessage(error.message);
      setDialogOpen(true);
    }
    setLoading(false);
  };

  // FORGOT PASSWORD
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setDialogMessage("Please enter your email to reset password.");
      setDialogOpen(true);
      return;
    }
    setLoading(true);
    await Auth.handleForgotPassword(email); // <--- real submit
    setDialogMessage("Check your email for a password reset link.");
    setLoading(false);
    setDialogOpen(true);
  };

  // Animations for the card content
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Feedback dialog (modal) */}
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

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Reset Password"
              : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Sign up with your Email and Password"
              : mode === "forgot"
              ? "Enter your email to receive a password reset link"
              : "Login with your Email and Password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence initial={false} mode="wait">
            {/* LOGIN */}
            {mode === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.27, type: "tween" }}
                onSubmit={handleAuth}
                autoComplete="off"
              >
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                          onClick={() => {
                            setMode("forgot");
                          }}
                        >
                          Forgot your password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      Login
                    </Button>
                  </div>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <div className="flex justify-center space-x-10">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={loading}
                    >
                      Continue with <IconBrandGoogleFilled className="mr-2" />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("azure")}
                      disabled={loading}
                    >
                      Continue with <IconBrandWindows className="mr-2" />
                    </Button>
                  </div>
                  <div className="text-center text-sm mt-3">
                    Don&#39;t have an account?
                    <button
                      type="button"
                      className="underline underline-offset-4 ml-2"
                      onClick={() => {
                        setMode("signup");
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {/* SIGNUP */}
            {mode === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.27, type: "tween" }}
                onSubmit={handleAuth}
                autoComplete="off"
              >
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      Sign up
                    </Button>
                  </div>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                  <div className="flex justify-center space-x-10">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={loading}
                    >
                      Continue with <IconBrandGoogleFilled className="mr-2" />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleOAuthLogin("azure")}
                      disabled={loading}
                    >
                      Continue with <IconBrandWindows className="mr-2" />
                    </Button>
                  </div>
                  <div className="text-center text-sm mt-3">
                    Already have an account?
                    <button
                      type="button"
                      className="underline underline-offset-4 ml-2"
                      onClick={() => {
                        setMode("login");
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {/* FORGOT PASSWORD */}
            {mode === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.27, type: "tween" }}
                onSubmit={handleForgotPasswordSubmit} // <--- USE CORRECT HANDLER
                autoComplete="off"
              >
                <div className="grid gap-6">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    Send reset link
                  </Button>
                  <div className="text-center text-sm mt-3">
                    <button
                      type="button"
                      className="underline underline-offset-4"
                      onClick={() => setMode("login")}
                    >
                      Back to login
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
