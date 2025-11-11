"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useRef, useState } from "react";

export function EmailVerification({ email }: { email: string }) {
  const [timeToNextReSend, setTimeToNextResend] = useState(30);
  const interval = useRef<NodeJS.Timeout>(undefined);

  function startCountdown() {
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;

        if (newT <= 0) {
          clearInterval(interval.current);
          return 0;
        }
        return newT;
      });
    }, 1000);
  }

  useEffect(() => {
    startCountdown();

    return () => clearInterval(interval.current);
  }, []);

  async function handleResendEmail() {
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    });

    if (!result.error) {
      setTimeToNextResend(30);
      startCountdown();
    }

    return result;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">
        We sent you a verification link, Please check your inbox at your email and click the link to verify your
        account.
      </p>

      <BetterAuthActionButton
        variant="outline"
        className="w-full"
        successMessage="Verification email sent!"
        disabled={timeToNextReSend > 0}
        action={handleResendEmail}
      >
        {timeToNextReSend > 0 ? `Resend Email (${timeToNextReSend})` : "Resend Email"}
      </BetterAuthActionButton>
    </div>
  );
}
