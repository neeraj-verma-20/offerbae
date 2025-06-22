import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // ✅ Compare with environment variables
        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "admin", name: "Admin", email };
        }

        return null; // ❌ Invalid credentials
      },
    }),
  ],

  // ✅ Custom login page
  pages: {
    signIn: "/login",
  },

  // ✅ For App Router compatibility
  session: {
    strategy: "jwt",
  },

  // ✅ Ensure session has user info
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },

  // ✅ Your secret
  secret: process.env.NEXTAUTH_SECRET,
};
