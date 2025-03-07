import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "next-sanity";

// Create Sanity client for authentication
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03", // Use a current API version
  useCdn: false, // Don't use CDN for authentication to get latest data
  token: process.env.SANITY_API_TOKEN, // Only needed if users are not publicly readable
});

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
              role,
              partnerIdToSend,
              partnerIdToReceiveFrom
            }`,
            { login: credentials.login }
          );

          const user = users;

          if (!user || user.password !== credentials.password) {
            return null;
          }

          return {
            id: user._id,
            name: user.name,
            login: user.login,
            role: user.role,
            partnerIdToSend: user.partnerIdToSend,
            partnerIdToReceiveFrom: user.partnerIdToReceiveFrom
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
        token.role = user.role;
        token.id = user.id;
        token.login = user.login; // Make sure login is explicitly assigned
        token.partnerIdToSend = user.partnerIdToSend;
        token.partnerIdToReceiveFrom = user.partnerIdToReceiveFrom;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.login = token.login; // Make sure login is explicitly assigned
        session.user.role = token.role;
        session.user.partnerIdToSend = token.partnerIdToSend;
        session.user.partnerIdToReceiveFrom = token.partnerIdToReceiveFrom;
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
