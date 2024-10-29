import "next-auth";
import { DefaultSession } from "next-auth";

// TODO: これの意味を理解する、既存のセッション型を拡張できる。
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}
