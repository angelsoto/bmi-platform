/**
 * Authorization middleware for project-scoped API routes.
 * Checks the user is authenticated and has the required role.
 */

import { auth } from "./index";
import { prisma } from "@/lib/db/prisma";

export class AuthorizationError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export class AuthenticationError extends Error {
  status: number;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
    this.status = 401;
  }
}

export type ProjectRole = "owner" | "member";

const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  member: 1,
  owner: 2,
};

/**
 * Authorize the current user for a project-scoped action.
 * Throws if not authenticated, not a member, or role insufficient.
 * Returns the membership record on success.
 */
export async function authorizeProject(
  projectId: string,
  minimumRole: ProjectRole = "member"
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new AuthenticationError();
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  if (!membership) {
    throw new AuthorizationError("Not a member of this project");
  }

  const userLevel = ROLE_HIERARCHY[membership.role as ProjectRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

  if (userLevel < requiredLevel) {
    throw new AuthorizationError(
      `Insufficient role. Required: ${minimumRole}, has: ${membership.role}`
    );
  }

  return { userId, membership };
}

/**
 * Get the current authenticated user.
 * Throws if not authenticated.
 */
export async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new AuthenticationError();
  }
  return { userId, email: session.user.email };
}
