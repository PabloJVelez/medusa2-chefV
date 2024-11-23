import { MedusaRequest, MedusaResponse } from '@medusajs/framework'

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  console.log("REQUEST BODY", req.body)
  res.sendStatus(200)
}


export const AUTHENTICATE = false