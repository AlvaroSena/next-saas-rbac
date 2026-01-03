"use server";

import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const githubClientId = process.env.GITHUB_OAUTH_CLIENT_ID!;

  const githubSignInURL = new URL(
    "login/oauth/authorize",
    "https://github.com"
  );

  const redirectURI = process.env.GITHUB_OAUTH_REDIRECT_URI!;

  githubSignInURL.searchParams.set("client_id", githubClientId);
  githubSignInURL.searchParams.set("redirect_uri", redirectURI);
  githubSignInURL.searchParams.set("scope", "user");

  redirect(githubSignInURL.toString());
}
