"use server";

import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID!;

  const githubSignInURL = new URL(
    "login/oauth/authorize",
    "https://github.com"
  );

  githubSignInURL.searchParams.set("client_id", githubClientId);
  githubSignInURL.searchParams.set(
    "redirect_uri",
    "http://localhost:3000/api/auth/callback"
  );
  githubSignInURL.searchParams.set("scope", "user");

  redirect(githubSignInURL.toString());
}
