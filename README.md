# Image Generator

Image Generator using Replicate API in the backend, exposing [lucatao/flux-dev-lora](https://replicate.com/lucataco/flux-dev-lora) FLUX.1-Dev LoRA Explorer.

## Noteworthy files

- [app/page.js](app/page.js) - React frontend that renders the home page in the browser
- [app/api/predictions/route.js](app/api/predictions/route.js) - API endpoint that calls Replicate's API to create a prediction
- [app/api/predictions/[id]/route.js](app/api/predictions/[id]/route.js) - API endpoint that calls Replicate's API to get the prediction result
- [app/api/webhooks/route.js](app/api/webhooks/route.js) - API endpoint that receives and validates webhooks from Replicate

## Running the app

Install dependencies:

```shell
npm install
```

Create a git-ignored text file for storing secrets like your API token:

```shell
cp .env.template .env.local
```

Add your [Replicate API token](https://replicate.com/account/api-tokens) to `.env.local`:

```
REPLICATE_API_TOKEN=<your-token-here>
```

Run the development server:

```shell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Webhooks

Webhooks provide real-time updates about your predictions. When you create a prediction or training, specify a URL that you control and Replicate will send HTTP POST requests to that URL when the prediction is created, updated, and completed.

This app is set up to optionally request, receive, and validate webhooks.

### How webhooks work

1. You specify a webhook URL when creating a prediction in [app/api/predictions/[id]/route.js](app/api/predictions/[id]/route.js)
1. Replicate sends POST requests to the handler in [app/api/webhooks/route.js](app/api/webhooks/route.js) as the prediction is updated.

### Requesting and receiving webhooks

To test webhooks in development, you'll need to create a secure tunnel to your local machine, so Replicate can send POST requests to it. Follow these steps:

1. [Download and set up `ngrok`](https://replicate.com/docs/webhooks#testing-your-webhook-code), an open-source tool that creates a secure tunnel to your local machine so you can receive webhooks.
1. Run ngrok to create a publicly accessible URL to your local machine: `ngrok http 3000`. Alternatively, you can also run `npx ngrok http 3000`
1. Copy the resulting ngrok.app URL and paste it into `.env.local`, like this: `NGROK_HOST="https://020228d056d0.ngrok.app"`. Leave ngrok running.
1. In a separate terminal window, run the app with `npm run dev`
1. Open [localhost:3000](http://localhost:3000) in your browser and enter a prompt to generate an image.
1. Go to [replicate.com/webhooks](https://replicate.com/webhooks) to see your prediction status.

### Validating incoming webhooks

Follow these steps to set up your development environment to validate incoming webhooks:

1. Get your signing secret by running:
    ```
    curl -s -X GET -H "Authorization: Bearer $REPLICATE_API_TOKEN" https://api.replicate.com/v1/webhooks/default/secret
    ```
1. Add this secret to `.env.local`, like this: `REPLICATE_WEBHOOK_SIGNING_SECRET=whsec_...`
1. Now when you run a prediction, the webhook handler in [app/api/webhooks/route.js](app/api/webhooks/route.js) will verify the webhook.

## Learn More

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
It uses Next's newer [App Router](https://nextjs.org/docs/app) and [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
