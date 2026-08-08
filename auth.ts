import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const scryptAsync = promisify(scrypt);

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    const [salt, stored] = hash.split(":");
    if (!salt || !stored) return false;
    const buf = (await scryptAsync(plain, salt, 64)) as Buffer;
    const storedBuf = Buffer.from(stored, "hex");
    if (buf.length !== storedBuf.length) return false;
    return timingSafeEqual(buf, storedBuf);
  } catch {
    return false;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const email = (credentials.username as string).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, role: true, passwordHash: true },
        });

        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(credentials.password as string, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
