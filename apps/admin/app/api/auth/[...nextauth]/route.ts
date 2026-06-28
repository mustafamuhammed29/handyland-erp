import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth failed: Missing credentials");
          return null;
        }

        const adminEmail = "admin@handyland.de";
        const adminPasswordHash = "$2b$10$rjG3FrT/7FApSEuV46OxEuklT9nc6RSBEVfXRxA0DpPJznQpCg9Nq";
        const enteredEmail = credentials.email.trim();
        const enteredPassword = credentials.password.trim();

        if (enteredEmail === adminEmail && adminPasswordHash) {
          const isValid = bcrypt.compareSync(enteredPassword, adminPasswordHash);
          if (isValid) {
            return { id: "1", name: "Admin", email: adminEmail };
          }
        }
        
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "handyland-secret-key-change-in-production",
});

export { handler as GET, handler as POST };
