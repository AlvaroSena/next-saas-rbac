"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { AlertTriangle, Github, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFormState } from "@/hooks/use-form-state";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithGithub } from "../actions";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [{ success, message, errors }, handleSubmit, isPending] = useFormState(
    signInWithEmailAndPassword,
    () => {
      router.push("/");
    }
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed!</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            id="email"
            defaultValue={searchParams.get("email") ?? ""}
          />

          {errors?.email && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" id="password" />

          {errors?.password && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors.password[0]}
            </p>
          )}

          <Link
            href="/auth/forgot-password"
            className="text-foreground text-xs font-medium hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Sign In with e-mail
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full"
          size="sm"
          asChild
        >
          <Link href="/auth/sign-up">Create new account</Link>
        </Button>
      </form>

      <Separator />

      <form action={signInWithGithub}>
        <Button type="submit" variant="outline" className="w-full">
          <Github />
          Sign In with Github
        </Button>
      </form>
    </div>
  );
}
