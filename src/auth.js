import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sanityClient } from "@/lib/sanity";
import {
  hashPassword,
  isPasswordHash,
  verifyPassword,
} from "@/lib/password";
import { getLiveUser } from "@/lib/user-access";

function clearAuthorizationClaims(token) {
  token.role = undefined;
  token.authorizationValid = false;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "login", type: "login" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          return null;
        }

        try {
          const users = await sanityClient.fetch(
            `*[_type == "user" && login == $login][0]{
              _id,
              name,
              login,
              password,
              role
            }`,
            { login: credentials.login }
          );

          const user = users;

          if (
            !user ||
            !(await verifyPassword(String(credentials.password), user.password))
          ) {
            return null;
          }

          // Upgrade legacy plaintext credentials after the first valid login.
          if (!isPasswordHash(user.password)) {
            await sanityClient
              .patch(user._id)
              .set({ password: await hashPassword(String(credentials.password)) })
              .commit();
          }

          return {
            id: user._id,
            name: user.name,
            login: user.login,
            role: user.role,
          };
        } catch (error) {
          console.error("Error authenticating user:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (!token.id) {
        clearAuthorizationClaims(token);
        return token;
      }

      try {
        const liveUser = await getLiveUser(String(token.id));
        if (!liveUser) {
          clearAuthorizationClaims(token);
          return token;
        }

        token.name = liveUser.name;
        token.login = liveUser.login;
        token.role = liveUser.role || "user";
        token.authorizationValid = true;

        const lastActiveAt = liveUser.lastActiveAt
          ? new Date(liveUser.lastActiveAt).getTime()
          : 0;
        if (Date.now() - lastActiveAt > 15 * 60 * 1000) {
          try {
            await sanityClient
              .patch(liveUser._id)
              .set({ lastActiveAt: new Date().toISOString() })
              .commit();
          } catch (error) {
            console.error("Error recording user activity:", error);
          }
        }
      } catch (error) {
        console.error("Error refreshing authorization claims:", error);
        clearAuthorizationClaims(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.authorizationValid) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.login = token.login;
        session.user.role = token.role;
      } else {
        session.user = undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
});
