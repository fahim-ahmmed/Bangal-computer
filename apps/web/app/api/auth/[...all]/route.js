import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// বিল্ডের সময় এই রুট প্রি-রেন্ডার/প্রি-এভালুয়েট না করার জন্য
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth.handler);