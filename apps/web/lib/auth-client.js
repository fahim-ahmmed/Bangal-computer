"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3001"
  );
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;