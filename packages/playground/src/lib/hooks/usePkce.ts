/**
 * NOT IN USE - Still buggy
 */

import type { Challenge } from "@openauthjs/openauth/client";
import { createSubjects } from "@openauthjs/openauth/subject";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { openAuthClient, redirectUrl } from "../auth";

export function usePkce() {
  const login = async () => {
    const { challenge, url } = await openAuthClient.authorize(
      redirectUrl,
      "code",
      {
        pkce: true,
      },
    );
    localStorage.setItem("challenge", JSON.stringify(challenge));
    document.location = url;
  };

  const { code } = useSearch({ strict: false });

  useEffect(() => {
    if (code) {
      const challenge: Challenge = JSON.parse(
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        localStorage.getItem("challenge")!,
      );

      (async () => {
        const exchanged = await openAuthClient.exchange(
          code,
          redirectUrl,
          challenge.verifier,
        );

        if (exchanged.err) {
          throw new Error("Invalid code");
        }

        const subjects = createSubjects({
          user: z.object({
            email: z.string().email(),
            githubUserId: z.number(),
          }),
        });

        localStorage.setItem("fpAccessToken", exchanged.tokens.access);
        localStorage.setItem("fpRefreshToken", exchanged.tokens.access);

        const verified = await openAuthClient.verify(
          subjects,
          exchanged.tokens.access,
        );

        console.log(verified);
      })();
    }
  }, [code]);

  return {
    login,
  };
}
