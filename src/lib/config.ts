import { prisma } from "@/lib/prisma";

const ENV_DEFAULT = Number(process.env.EDIT_WINDOW_MINUTES) || 10;

/** Editable time window in minutes. Reads from DB (admin-configurable), falls back to env. */
export async function getEditWindowMinutes(): Promise<number> {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: "default" },
      select: { editWindowMinutes: true },
    });
    return config?.editWindowMinutes ?? ENV_DEFAULT;
  } catch {
    return ENV_DEFAULT;
  }
}

export function isWithinEditWindow(
  createdAt: Date,
  windowMinutes: number
): boolean {
  const windowMs = windowMinutes * 60 * 1000;
  return Date.now() - createdAt.getTime() <= windowMs;
}
