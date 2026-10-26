# Food Pivot: Gemma picks dinner so you do not have to

The annoying minute is standing in front of a delivery app, already tired, still choosing. Food Pivot takes the mood in one sentence, remembers the diet, the allergies, and the last orders, and names one plate.

Gemma 4 (`google/gemma-4-26b-a4b-it` through OpenRouter) writes the choice. It can only name a dish the rules already kept: right diet, no listed allergen, inside the delivery radius, inside the budget when one was stated. If the key is missing, or the model names an id that is not on that list, the ranker keeps its own top plate. Checkout never places a real order.

Past meals sit in Postgres. Locally that is a Timescale container. On a host it is a Tiger Data connection string in `DATABASE_URL`.

## What it saves

The screen is one decision instead of a scroll. You still approve the cart.

## Deploy

- Render: Blueprint in `render.yaml`.
- DigitalOcean App Platform: `.do/app.yaml`.
- Tiger Data: `DATABASE_URL`, then `pnpm db:push`.

Gemma is the open-weight model. Swapping `OPENROUTER_MODEL` does not change the menu rules.

## Prize notes

Gemma makes the pick. Tiger Data holds the history. Render or DigitalOcean hosts the Next.js app. The other sponsor tools are not in this build.
