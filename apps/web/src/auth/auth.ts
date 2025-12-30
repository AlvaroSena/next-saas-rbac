import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getProfile } from "@/http/get-profile";

export async function isAuthenticated() {
  const token = (await cookies()).get("token")?.value;

  return !!token;
}

export async function auth() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/auth/sign-in");
  }

  try {
    const { user } = await getProfile();

    return { user };
  } catch (err) {
    console.log(err);
  }

  redirect("/api/auth/sign-out");
}
