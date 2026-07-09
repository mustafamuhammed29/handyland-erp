import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@repo/database";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@handyland.de" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email und Passwort eingeben");
        }

        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email }
        });

        if (!staff || !staff.isActive) {
          throw new Error("Ungültige Zugangsdaten oder Konto deaktiviert");
        }

        const isValid = await bcrypt.compare(credentials.password, staff.password);
        if (!isValid) {
          throw new Error("Ungültige Zugangsdaten");
        }

        // Update last active
        await prisma.staff.update({
          where: { id: staff.id },
          data: { lastActiveAt: new Date() }
        });

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
