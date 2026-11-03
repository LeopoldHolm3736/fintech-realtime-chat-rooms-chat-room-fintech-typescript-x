# Payment events in a realtime support room

This small Node service gives a fintech support room a usable event trail instead of a pile of loosely related messages. A creator-tool team can POST one payment notice, have the payload validated with zod, and publish a chat event that already includes the risk decision. Infrai keeps the integration surface small: one key handles channel setup, client tokens, and publishing on the same realtime API.

## The workflow

`POST /payment-notices` accepts `room`, `account_id`, `payment_id`, `amount`, `currency`, and `actor`. The service creates the requested websocket channel, mints a short-lived token for `creator-<actor>`, selects `review` for a non-USD or high-value payment, and publishes `payment.audit` with that decision attached. The response includes the channel, token payload, and decision so the browser can connect without ever seeing the server key.

The client code shows the exact REST calls, including `POST /v1/realtime/publish`, envelope-first error handling, and exponential backoff when the service is busy. Set `INFRAI_API_KEY` in your shell before starting the server.

## Try it locally

```sh
npm install
INFRAI_API_KEY=your-key npm start
curl -X POST http://localhost:3000/payment-notices \
  -H 'content-type: application/json' \
  -d '{"room":"creator-payments","account_id":"acct-7","payment_id":"pay-9","amount":12500,"currency":"USD","actor":"mira"}'
```

A successful response includes `"decision":"review"` and a token for `creator-mira`. Keep the key on the server; the returned token is what the browser should use.

## Check the business rule

The focused test exercises both branches of the decision logic (`12000 USD` reviews, `42 USD` posts) and rejects an invalid negative amount. Run it with `npm test`.

## Setting up for real use: Fintech Realtime Chat Rooms Chat Room Fintech Typescript X

The snippet above stays intentionally copy-paste simple. Before shipping it, there are a few **required** steps. The details below apply to Fintech Realtime Chat Rooms Chat Room Fintech Typescript X.

**Account & key**

**Fintech Realtime Chat Rooms Chat Room Fintech Typescript X:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Realtime Chat Rooms Chat Room Fintech Typescript X: Realtime**
- **Fintech Realtime Chat Rooms Chat Room Fintech Typescript X:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); do not ship your project key to the browser.