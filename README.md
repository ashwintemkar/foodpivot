# Food Pivot

You are tired and do not want to decide dinner. Food Pivot reads the mood, keeps the diet and allergy rules, and asks Gemma 4 to pick one plate that is already on the menu.

The menu, the distance, and the allergies are code. Gemma only chooses among dishes those rules already allowed. Backboard sends that request. If `BACKBOARD_API_KEY` is missing, the same ranker decides.

## Local

```bash
docker compose up -d
copy .env.example .env
pnpm install
pnpm db:push
pnpm dev
```

`DATABASE_URL` for the local Tiger (Timescale) container:

```
postgresql://foodpilot:foodpilot@127.0.0.1:55432/foodpilot
```

Set `BACKBOARD_API_KEY`. The model defaults to `gemma-4-26b-a4b-it` through Backboard's `google` provider. Change `BACKBOARD_LLM_PROVIDER` and `BACKBOARD_MODEL_NAME` if your Backboard account lists Gemma under a different pair.

## Deploy

**Tiger Data.** Create a Tiger service, copy the Postgres connection string into `DATABASE_URL`, then `pnpm db:push`. The local compose file is the same Postgres shape.

**Render.** New Blueprint from this repo. It reads `render.yaml`. Set `BACKBOARD_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` to the Render URL.

**DigitalOcean App Platform.** The spec is `.do/app.yaml`. Point it at `ashwintemkar/foodpivot` and set the same secrets. A GPU Droplet is not required: Gemma is called through Backboard.

Orders are staged in the app. Checkout does not call a restaurant.
