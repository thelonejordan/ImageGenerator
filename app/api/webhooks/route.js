// The Replicate webhook is a POST request where the request body is a prediction object.
// Identical webhooks can be sent multiple times, so this handler must be idempotent.

// import crypto from 'crypto';
import { NextResponse } from "next/server";
import { validateWebhook } from 'replicate';

/*
async function fetchSecret() {
  const response = await fetch('https://api.replicate.com/v1/webhooks/default/secret', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch the webhook secret');
  }

  const { key } = await response.json();
  return key;
}

// https://replicate.com/docs/topics/webhooks/verify-webhook

function validateWebhook(request, secret) {
  const webhookId = request.headers.get('webhook-id');
  const webhookTimestamp = request.headers.get('webhook-timestamp');
  const webhookSignatures = request.headers.get('webhook-signature');
  const body = request.text();

  if (!webhookId || !webhookTimestamp || !webhookSignatures) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  const expectedSignatures = webhookSignatures.split(' ').map(sig => sig.split(',')[1]);

  // Construct the signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
  // Base64 decode the secret
  const secretBytes = Buffer.from(secret.split('_')[1], "base64");
  const computedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const webhookIsValid = expectedSignatures.some(expectedSignature => {
    const computedBuffer = Buffer.from(computedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Ensure both buffers are the same length before comparing
    if (computedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(computedBuffer, expectedBuffer);
  });
  return webhookIsValid;
}
*/

export async function POST(request) {
  // console.log("Received webhook...");

  // Fetch the secret dynamically
  // const secret = await fetchSecret();

  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    // console.log("Skipping webhook validation. To validate webhooks, set REPLICATE_WEBHOOK_SIGNING_SECRET")
    return NextResponse.json({ detail: "Webhook received (but not validated)" }, { status: 200 });
  }

  const webhookIsValid = validateWebhook(request.clone(), secret);

  if (!webhookIsValid) {
    return NextResponse.json({ detail: "Webhook is invalid" }, { status: 401 });
  }

  // process validated webhook here... maybe save image to drive (TODO)
  // console.log("Webhook is valid!");
  // const body = await request.json();
  // console.log(body);

  return NextResponse.json({ detail: "Webhook is valid" }, { status: 200 });
}
