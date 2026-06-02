import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email as string;

        // Demo mode: auto-create or find user by email
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
            },
          });

          // Auto-attach seeded projects owned by other users
          const seedOwner = await prisma.user.findFirst({
            where: { email: { not: email } },
            orderBy: { createdAt: "asc" },
          });
          if (seedOwner) {
            const seedProjects = await prisma.project.findMany({
              where: { ownerId: seedOwner.id },
              select: { id: true },
            });
            if (seedProjects.length > 0) {
              for (const p of seedProjects) {
                await prisma.projectMember.upsert({
                  where: { userId_projectId: { userId: user!.id, projectId: p.id } },
                  update: {},
                  create: { userId: user!.id, projectId: p.id, role: "member" },
                });
              }
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};
