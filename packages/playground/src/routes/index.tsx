import { Layout } from "@/Layout";
import { PlaygroundPage } from "@/components/playground";
import { useStudioStore } from "@/components/playground/store";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/auth";
import { useSettingsOpen } from "@/hooks";
import { useHandler } from "@fiberplane/hooks";
import { type Challenge, createClient } from "@openauthjs/openauth/client";
import { createSubjects } from "@openauthjs/openauth/subject";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useCallback, useContext, useEffect } from "react";
import { z } from "zod";

const redirectUrl = "http://localhost:7676/fp";

const SettingsRouteSchema = z.object({
  settings: z.boolean().optional(),
  code: z.string().optional(),
});

const ApiRouteSchema = SettingsRouteSchema.extend({
  method: z.string().optional(),
  uri: z.string().optional(),
});

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search) => ApiRouteSchema.parse(search),
});

const client = createClient({
  clientID: "fp-playground",
  issuer: "https://auth.fp.dev",
});

/**
 * The main page of the playground, a Fiberplane Studio-like interface for interacting with the API.
 */
function Index() {
  const search = Route.useSearch();
  const { appRoutes, setActiveRoute } = useStudioStore(
    "appRoutes",
    "setActiveRoute",
  );

  const { setSettingsOpen } = useSettingsOpen();

  const updateActiveRoute = useCallback(
    (method: string, path: string) => {
      const route = appRoutes.find(
        (r) => r.method === method && r.path === path,
      );
      if (route) {
        setActiveRoute(route);
      }
    },
    [appRoutes, setActiveRoute],
  );

  const setDefault = useHandler(() => {
    if (appRoutes.length === 0) {
      // If there are no routes there isn't much to reset to.
      return;
    }
    const route = appRoutes[0];
    setActiveRoute(route);
  });

  const { settings: showSettings = false, method, uri } = search || {};
  useEffect(() => {
    setSettingsOpen(showSettings);
  }, [showSettings, setSettingsOpen]);

  useEffect(() => {
    if (method && uri) {
      updateActiveRoute(method, uri);
    } else {
      setDefault();
    }
  }, [method, uri, updateActiveRoute, setDefault]);

  const login2 = useHandler(async () => {
    document.location = "/fp/api/auth/authorize";
  });

  const login = async () => {
    const { challenge, url } = await client.authorize(redirectUrl, "code", {
      pkce: true,
    });
    localStorage.setItem("challenge", JSON.stringify(challenge));
    document.location = url;
  };

  const { code } = useSearch({ strict: false });

  useEffect(() => {
    if (code) {
      const challenge: Challenge = JSON.parse(
        localStorage.getItem("challenge")!,
      );

      (async () => {
        const exchanged = await client.exchange(
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

        const verified = await client.verify(subjects, exchanged.tokens.access);

        console.log(verified);
      })();
    }
  }, [code]);

  const [user, setUser] = useContext(AuthContext);
  useEffect(() => {
    (async () => {
      const response = await fetch("/fp/api/auth/profile");
      const json = await response.json();
      console.log(json);
      setUser(json);
    })();
  }, [setUser]);

  return (
    <Layout>
      <pre>{JSON.stringify(user)}</pre>
      <Button onClick={login}>Login PKCE</Button>
      <Button onClick={login2}>Login session</Button>
      <PlaygroundPage />
    </Layout>
  );
}
