import type { DefaultSession, DefaultUser } from "next-auth";

type AppUserRole = "OWNER" | "ADMIN" | "USER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppUserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: AppUserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppUserRole;
  }
}

