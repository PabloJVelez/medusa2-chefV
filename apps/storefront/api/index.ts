// SSR entry for Vercel (Node runtime)
import * as build from "../build/server/index.js";

export default async function handler(req: any, res: any) {
  const mod: any = await import("@react-router/node");

  // Normalize possible module shapes:
  // - function (default export is the handler creator)
  // - { default: function }
  // - { createRequestHandler } or { default: { createRequestHandler } }
  const createRequestHandler =
    (typeof mod === "function" && mod) ||
    (typeof mod?.default === "function" && mod.default) ||
    mod?.createRequestHandler ||
    mod?.default?.createRequestHandler;

  if (typeof createRequestHandler !== "function") {
    res.statusCode = 500;
    res.end("createRequestHandler not found in @react-router/node");
    return;
  }

  return createRequestHandler(build, process.env.NODE_ENV)(req, res);
}
