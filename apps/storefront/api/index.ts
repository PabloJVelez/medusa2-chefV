// Serverless entry for Vercel (Node runtime)

// RRv7 exports the handler creator from *react-router*
import { createRequestHandler, type ServerBuild } from "react-router";

// Do NOT import the virtual module here. Vercel’s function bundler
// doesn’t know about Vite’s virtual modules.
// Import the *built* server bundle instead:
import * as build from "../build/server/index.js";

// If your editor complains about types (mixing Remix types, etc),
// cast to ServerBuild – Vercel doesn’t type-check on deploy anyway.
const rrBuild = build as unknown as ServerBuild;

export const config = { runtime: "nodejs" }; // force Node runtime

// Web-standard fetch handler for Vercel Node 20/22
export default createRequestHandler(rrBuild);
