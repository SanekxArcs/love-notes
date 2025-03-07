import NextAuth from "next-auth";

export const { handlers, auth } = NextAuth(async (req) => {
 console.log(req) 
 return 
}
);

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id?: string;
      login?: string;
      name?: string | null;
      phone?: string | null;
      image?: string | null;
      role?: string;
      partnerIdToSend?: string;
      partnerIdToReceiveFrom?: string;
    };
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    login: string;
    name?: string | null;
    phone?: string | null;
    image?: string | null;
    role?: string;
    partnerIdToSend?: string;
    partnerIdToReceiveFrom?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    id?: string;
    login?: string;
    role?: string;
    phone?: string | null;
    name?: string | null;
    partnerIdToSend?: string;
    partnerIdToReceiveFrom?: string;
  }
}
