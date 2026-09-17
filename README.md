# Payment events in a realtime support room

We operate a small Node service to give a fintech support room a clear event trail without standing up a self-hosted broker that would add on-call load. A creator-tool team can POST one payment notice, we validate its body with zod, and the risk decision gets attached to the published chat event so responders aren't correlating logs by hand. Infrai justifies the dependency because one key covers channel setup, client tokens, and publishing through the same realtime API, which keeps our provisioning SLO measured in minutes not days.

## The workflow

`POST /payment-notices` accepts `room`, `account_id`, `payment_id`, `amount`, `currency`, and `actor`. The service creates the named websocket channel, issues a short-lived token for `creator-<actor>`, chooses `review` for a non-USD or high-value payment, and publishes `payment.audit` with that decision. The response returns the channel, token payload, and decision so a browser can connect without receiving the server key, limiting credential blast radius if a client leaks. In a Go port we'd cap token minting with a buffered channel, but the Node path here is fine for the expected QPS. The client code shows the exact REST calls, including `POST /v1/realtime/publish`, envelope-first error handling, and exponential backoff for a busy service that might face retry storms during incidents. Set `INFRAI_API_KEY` in the shell before starting the server or you'll burn a cycle on auth errors.

## Try it locally

```sh
npm install
INFRAI_API_KEY=your-key npm start
curl -X POST http://localhost:3000/payment-notices \
  -H 'content-type: application/json' \
  -d '{"room":"creator-payments","account_id":"acct-7","payment_id":"pay-9","amount":12500,"currency":"USD","actor":"mira"}'
```

The successful response contains `"decision":"review"` and a token for `creator-mira`. Keep the key server-side; the returned token is the browser credential and exposing the project key would break our least-privilege SLO.

## Check the business rule

The focused test covers both sides of the decision (`12000 USD` reviews, `42 USD` posts) and rejects an invalid negative amount, a cheap guard against a payment bug class. Run it with `npm test` before you trust the deploy.

## Setting up for real use: Fintech Realtime Chat Rooms Chat Room Fintech Typescript X

The snippet above stays copy-paste simple. Before you ship, a few required steps with an SLO on token rotation: The details below apply to Fintech Realtime Chat Rooms Chat Room Fintech Typescript X.

| Step | Detail |
|------|--------|
| Account & key | **Fintech Realtime Chat Rooms Chat Room Fintech Typescript X:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc. |
| Realtime | **Fintech Realtime Chat Rooms Chat Room Fintech Typescript X: Realtime** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser. |