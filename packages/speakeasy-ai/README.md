# speakeasy-ai

OpenAI-compatible client for Speakeasy with built-in x402 payment handling.

## Install

```bash
npm install speakeasy-ai
```

## Usage

```javascript
import { SpeakeasyClient } from 'speakeasy-ai';

const client = new SpeakeasyClient({
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
  // defaults to https://speakeasy.ing
});

const response = await client.chat.completions.create({
  model: 'deepseek-v3.2',
  messages: [{ role: 'user', content: 'Analyze this token...' }],
  stream: true,
});

for await (const chunk of response) {
  // SSE chunks as parsed JSON payloads
  console.log(chunk);
}
```

## What it handles internally

- initial request
- detects `402 Payment Required`
- parses x402 challenge payload
- signs EIP-712/EIP-3009 typed data with your wallet key
- replays request with payment proof headers
- returns normal JSON or stream iterator

## Environment

- `AGENT_WALLET_PRIVATE_KEY` (recommended app-level env)
