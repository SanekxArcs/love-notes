
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


const USERS = [
  {
    id: "1",
    name: "Іруська",
    login: "Sweetie",
    password: "sweetdreams",
    role: "user",
  },
  {
    id: "2",
    name: "Oleksandr",
    login: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    id: "3",
    name: "Tester",
    login: "Tester",
    password: "tester12",
    role: "user",
  },
];

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

        const user = USERS.find(
          (user) =>
            user.login === credentials.login &&
            user.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          login: user.login,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
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
