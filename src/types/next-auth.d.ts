import "next-auth";

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
    authorizationValid?: boolean;
  }
}
