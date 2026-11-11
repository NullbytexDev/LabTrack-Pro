import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, ShieldCheck, LifeBuoy } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { savePendingMove } from "@/components/account/PendingAccountMove";

function buildChallenge() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { a, b, answer: a + b };
}

export default function ForgotPassword() {
  const [mode, setMode] = useState("reset");
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [challenge, setChallenge] = useState(buildChallenge);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recovered, setRecovered] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(answer) !== challenge.answer) {
      setError("That human-check answer is not correct. Try the new sum.");
      setChallenge(buildChallenge());
      setAnswer("");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPasswordRequest(email.trim().toLowerCase());
    } catch {
      // Always show the same result so the form never reveals whether an account exists.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  const requestRecovery = async (event) => {
    event.preventDefault();
    setRecoveryError("");
    setRecoveryBusy(true);
    try {
      await api.functions.invoke("accountRecovery", {
        action: "request",
        recovery_email: recoveryEmail.trim().toLowerCase(),
      });
      setRecoveryStep("code");
    } catch (err) {
      setRecoveryError(err?.response?.data?.error || "The recovery code could not be requested.");
    } finally {
      setRecoveryBusy(false);
    }
  };

  const verifyRecovery = async (event) => {
    event.preventDefault();
    setRecoveryError("");
    setRecoveryBusy(true);
    try {
      const { data } = await api.functions.invoke("accountRecovery", {
        action: "verify",
        recovery_email: recoveryEmail.trim().toLowerCase(),
        code: recoveryCode.trim(),
      });
      savePendingMove({ token: data.token, email: data.email });
      setRecovered(data.email);
      setRecoveryStep("done");
    } catch (err) {
      setRecoveryError(err?.response?.data?.error || "That code could not be confirmed.");
    } finally {
      setRecoveryBusy(false);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title={mode === "reset" ? "Reset password" : "Recover account"}
      subtitle={mode === "reset" ? "A human check, then a verified reset link" : "Prove it is you with your recovery email"}
      footer={
        <Link to="/signin" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      {mode === "reset" ? (
        sent ? (
          <div className="space-y-3 text-sm text-foreground">
            <p className="text-center">
              If an account exists with that email, a reset link is on its way. Open it and set a new password — the link
              carries its own verification code and expires shortly after it is sent.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Nothing arrived? Check spam, then wait a minute before requesting another link.
            </p>
            <button
              type="button"
              onClick={() => setMode("recovery")}
              className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" /> I cannot open that mailbox
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Human check
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-heading text-lg font-semibold tabular-nums">
                  {challenge.a} + {challenge.b} =
                </span>
                <Input
                  aria-label="Answer to the human check"
                  inputMode="numeric"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, ""))}
                  className="h-10 w-24"
                  required
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Complete this simple human check before submitting. Password reset requests are handled by the account service.
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <button
              type="button"
              onClick={() => setMode("recovery")}
              className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" /> Lost access to your sign-in email? Use your recovery email
            </button>
          </form>
        )
      ) : (
        <div className="space-y-4">
          {recoveryStep === "email" && (
            <form onSubmit={requestRecovery} className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Enter the recovery email saved on your LabTrack account. We send a six-digit code there — it proves the
                account is yours even if you cannot open your sign-in mailbox.
              </p>
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Recovery email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    placeholder="backup@example.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              {recoveryError && (
                <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{recoveryError}</p>
              )}
              <Button type="submit" className="w-full h-12 font-medium" disabled={recoveryBusy}>
                {recoveryBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send recovery code
              </Button>
            </form>
          )}

          {recoveryStep === "code" && (
            <form onSubmit={verifyRecovery} className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                If that address is on a LabTrack account, a six-digit code is on its way. Enter it below.
              </p>
              <div className="space-y-2">
                <Label htmlFor="recovery-code">Six-digit code</Label>
                <Input
                  id="recovery-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ""))}
                  className="h-12 tracking-[0.4em]"
                  required
                />
              </div>
              {recoveryError && (
                <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{recoveryError}</p>
              )}
              <Button type="submit" className="w-full h-12 font-medium" disabled={recoveryBusy}>
                {recoveryBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirm code
              </Button>
              <button
                type="button"
                onClick={() => setRecoveryStep("email")}
                className="mx-auto block text-xs text-muted-foreground hover:text-foreground"
              >
                Use a different address
              </button>
            </form>
          )}

          {recoveryStep === "done" && (
            <div className="space-y-3 text-sm">
              <p className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs leading-relaxed text-primary">
                {recovered} is verified. Now sign in — or create the account — with that address and your LabTrack
                profile, role and history move onto it automatically.
              </p>
              <Button asChild className="w-full h-12 font-medium">
                <Link to="/signin">Continue to sign in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/register">Create the account with {recovered}</Link>
              </Button>
            </div>
          )}

          {recoveryStep !== "done" && (
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="mx-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Use a password reset link instead
            </button>
          )}
        </div>
      )}
    </AuthLayout>
  );
}