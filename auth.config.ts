import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config: NO database/adapter imports, so it can be used by
// middleware (Edge runtime). The Credentials provider that queries Prisma lives
// in auth.ts (Node runtime) which spreads this config. Session is JWT, so
// middleware only verifies the token — it never touches the database.
export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        // Populate user.id — candidate API routes authorize on session.user.id.
        (session.user as any).id = (token.id as string) ?? token.sub;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [],
} satisfies NextAuthConfig;
