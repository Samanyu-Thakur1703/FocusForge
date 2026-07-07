import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url()
});

const fallbackEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "development-placeholder-key",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000"
};

const rawEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
};

const isStrictProduction =
  process.env.VERCEL_ENV === "production" || process.env.FOCUSFORGE_ENV === "production";

function parseEnv() {
  if (isStrictProduction) {
    const parsed = publicEnvSchema.safeParse(rawEnv);

    if (!parsed.success) {
      const missingOrInvalid = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
      throw new Error(
        `Missing or invalid production environment variables: ${missingOrInvalid}. ` +
          "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_APP_URL."
      );
    }

    return parsed.data;
  }

  // Local development and CI builds can compile before a real Supabase project exists.
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: rawEnv.NEXT_PUBLIC_SUPABASE_URL ?? fallbackEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      rawEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fallbackEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: rawEnv.NEXT_PUBLIC_APP_URL ?? fallbackEnv.NEXT_PUBLIC_APP_URL
  });
}

export const env = parseEnv();
