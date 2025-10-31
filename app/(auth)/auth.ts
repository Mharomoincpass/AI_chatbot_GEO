import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { createGuestUser, getUser } from "@/lib/db/queries.mongo";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (credentials.userType === "guest") {
          const guest = await createGuestUser();
          return { id: guest.id, name: "Guest" };
        }
        // Add your regular user authentication logic here
        return null;
      },
    }),
  ],
});
