import ky from "ky";
import { getCookie as getServerCookie } from "cookies-next/server";
import { getCookie as getClientCookie } from "cookies-next/client";

export const api = ky.create({
  prefixUrl: "http://localhost:3333",
  hooks: {
    beforeRequest: [
      async (request) => {
        if (typeof window === "undefined") {
          const { cookies: serverCookies } = await import("next/headers");

          const token = await getServerCookie("token", {
            cookies: serverCookies,
          });

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        } else {
          const token = getClientCookie("token");

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      },
    ],
  },
});
