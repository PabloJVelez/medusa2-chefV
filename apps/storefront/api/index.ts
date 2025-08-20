// apps/storefront/api/index.ts
import * as build from "../build/server/index.js";

export default async (req: any, res: any) => {
  const rrNode: any = await import("@react-router/node");
  return rrNode.createRequestHandler(build, process.env.NODE_ENV)(req, res);
};
