import { createServer } from "node:http";
import { publishPaymentNotice } from "./fintech_chat.ts";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/payment-notices") { res.writeHead(404).end(); return; }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    const result = await publishPaymentNotice(JSON.parse(raw));
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: (error as Error).message }));
  }
});
server.listen(Number(process.env.PORT ?? 3000), () => console.log("payment chat listening"));
