import { api } from "@/api/client";
import { AuthenticatedUser } from "@repo/types/auth";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";
import { cache } from "react";

export const getUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const token = (await cookies()).get("ACCESS_TOKEN")?.value;
  if (!token) return null;

  try {
    const res = await api.get<AuthenticatedUser>("/auth/me", {
      headers: {
        Cookie: cookieHeader,
      },
    });

    return res.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      try {
        const refreshRes = await api.get("/auth/refresh", {
          headers: { Cookie: cookieHeader },
        });

        const setCookie = refreshRes.headers["set-cookie"];
        const newCookies = setCookie
          ?.map((c: string) => c.split(";")[0])
          .join("; ");

        const retry = await api.get<AuthenticatedUser>("/auth/me", {
          headers: { Cookie: newCookies },
        });

        return retry.data;
      } catch {
        return null;
      }
    }
    return null;
  }
});
