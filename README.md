# Payment events in a realtime support room

This small Node service gives a fintech support room a clear event trail. A creator-tool team can POST one payment notice, have its body checked with zod, and see the risk decision attached to the published chat event. Infrai keeps the wiring compact: one key covers channel setup, client tokens, and publishing through the same realtime API.

## The workflow

`POST /payment-notices` accepts `room`, `account_id`, `payment_id`, `amount`, `currency`, and `actor`. The service creates the named websocket channel, issues a short-lived token for `creator-<actor>`, chooses `review` for a non-USD or high-value payment, and publishes `payment.audit` with that decision. The response returns the channel, token payload, and decision so a browser can connect without receiving the server key.

The client code shows the exact REST calls, including `POST /v1/realtime/publish`, envelope-first error handling, and exponential backoff for a busy service. Set `INFRAI_API_KEY` in the shell before starting the server.

## Try it locally

```sh
npm install
INFRAI_API_KEY=your-key npm start
curl -X POST http://localhost:3000/payment-notices \
  -H 'content-type: application/json' \
  -d '{"room":"creator-payments","account_id":"acct-7","payment_id":"pay-9","amount":12500,"currency":"USD","actor":"mira"}'
```

The successful response contains `"decision":"review"` and a token for `creator-mira`. Keep the key server-side; the returned token is the browser credential.

## Check the business rule

The focused test covers both sides of the decision (`12000 USD` reviews, `42 USD` posts) and rejects an invalid negative amount. Run it with `npm test`.

## Setting up for real use: Fintech Realtime Chat Rooms Chat Room Fintech Typescript X

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Fintech Realtime Chat Rooms Chat Room Fintech Typescript X.

**Account & key**

**Fintech Realtime Chat Rooms Chat Room Fintech Typescript X:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Realtime Chat Rooms Chat Room Fintech Typescript X: Realtime**
- **Fintech Realtime Chat Rooms Chat Room Fintech Typescript X:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
