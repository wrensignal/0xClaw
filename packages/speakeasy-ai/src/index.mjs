import { privateKeyToAccount } from 'viem/accounts';

const DEFAULT_BASE_URL = 'https://api.speakeasyrelay.com';

export class SpeakeasyError extends Error {}
export class X402ChallengeParseError extends SpeakeasyError {}
export class X402SigningError extends SpeakeasyError {}
export class SpeakeasyHTTPError extends SpeakeasyError {
  constructor(status, body) {
    super(`Speakeasy request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

function safeJSON(value) {
  try { return JSON.parse(value); } catch { return null; }
}

async function asJsonSafe(res) {
  const text = await res.text();
  return safeJSON(text) ?? { raw: text };
}

function pickChallengeCandidate(body) {
  const candidates = [
    body,
    body?.x402,
    body?.payment,
    body?.challenge,
    body?.paymentRequirement,
    body?.paymentRequirements,
    Array.isArray(body?.paymentRequirements) ? body.paymentRequirements[0] : null,
    body?.error?.data,
    body?.data
  ].filter(Boolean);

  for (const c of candidates) {
    if (c?.typedData || c?.eip712 || c?.payload?.typedData) return c;
  }
  return null;
}

function parse402Challenge(res, body) {
  const headerKeys = [
    'x402-challenge',
    'x-payment-challenge',
    'x402-payment-requirement',
    'x-payment-requirement',
    'x402-payment-requirements',
    'x-payment-requirements'
  ];
  const headerCandidate = headerKeys
    .map((k) => res.headers.get(k))
    .filter(Boolean)
    .map((v) => safeJSON(v) ?? v)
    .map((v) => (Array.isArray(v) ? v[0] : v))
    .find((v) => v && (v.typedData || v.eip712 || v.payload?.typedData));

  const bodyCandidate = pickChallengeCandidate(body);
  const raw = bodyCandidate || headerCandidate;
  if (!raw) throw new X402ChallengeParseError('Missing x402 challenge payload');

  const typedData = raw.typedData || raw.eip712 || raw.payload?.typedData;
  if (!typedData) throw new X402ChallengeParseError('Missing typedData in 402 challenge payload');

  return {
    id: raw.id || raw.challengeId || raw.paymentId || null,
    typedData,
    amount: raw.amount || raw.maxAmountRequired || null,
    payTo: raw.payTo || raw.recipient || null,
    raw
  };
}

function toReplayPayload(challenge, signature, address) {
  return {
    challengeId: challenge.id,
    typedData: challenge.typedData,
    signature,
    address,
    amount: challenge.amount,
    payTo: challenge.payTo
  };
}

function toReplayHeaders(challenge, signature, address) {
  const payload = toReplayPayload(challenge, signature, address);
  const encoded = JSON.stringify(payload);
  return {
    'x402-payment': encoded,
    'x-payment': encoded,
    'x402-signature': signature,
    'x-payment-signature': signature,
    'x402-address': address,
    'x-payment-address': address,
    ...(challenge.id ? { 'x402-challenge-id': String(challenge.id), 'x-payment-challenge-id': String(challenge.id) } : {})
  };
}

class ChatCompletionStream {
  constructor(response) {
    this.response = response;
  }

  async *[Symbol.asyncIterator]() {
    const reader = this.response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;
        const payload = line.replace(/^data:\s*/, '').trim();
        if (!payload || payload === '[DONE]') continue;
        yield safeJSON(payload) ?? { raw: payload };
      }
    }
  }
}

class ChatCompletionsAPI {
  constructor(client) {
    this.client = client;
  }

  async create(payload) {
    const { stream = false } = payload || {};
    const response = await this.client._requestWith402('/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (stream) return new ChatCompletionStream(response);
    return asJsonSafe(response);
  }
}

export class SpeakeasyClient {
  constructor({ privateKey, baseURL = DEFAULT_BASE_URL, fetchImpl } = {}) {
    if (!privateKey) throw new SpeakeasyError('privateKey is required');
    this.account = privateKeyToAccount(privateKey);
    this.baseURL = baseURL.replace(/\/$/, '');
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) throw new SpeakeasyError('No fetch implementation available');

    this.chat = { completions: new ChatCompletionsAPI(this) };
  }

  async _signChallenge(challenge) {
    try {
      const td = challenge.typedData;
      return await this.account.signTypedData({
        domain: td.domain,
        types: td.types,
        primaryType: td.primaryType,
        message: td.message
      });
    } catch (error) {
      throw new X402SigningError(`Failed to sign x402 challenge: ${error.message}`);
    }
  }

  async _requestWith402(path, init) {
    const url = `${this.baseURL}${path}`;
    let res = await this.fetch(url, init);

    if (res.status !== 402) {
      if (!res.ok) throw new SpeakeasyHTTPError(res.status, await asJsonSafe(res));
      return res;
    }

    const challengeBody = await asJsonSafe(res);
    const challenge = parse402Challenge(res, challengeBody);
    const signature = await this._signChallenge(challenge);
    const replayPayload = toReplayPayload(challenge, signature, this.account.address);
    const replayHeaders = toReplayHeaders(challenge, signature, this.account.address);

    res = await this.fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...replayHeaders
      },
      body: init.body
    });

    if (res.status === 402) {
      res = await this.fetch(url, {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...replayHeaders,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          ...(safeJSON(init.body) || {}),
          x402Payment: replayPayload,
          payment: replayPayload
        })
      });
    }

    if (!res.ok) throw new SpeakeasyHTTPError(res.status, await asJsonSafe(res));
    return res;
  }
}
