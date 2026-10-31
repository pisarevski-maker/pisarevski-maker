const MAX_BODY_BYTES = 32768;

function reply(status, error = null) {
  return Response.json(error ? {ok: false, error} : {ok: true}, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
    }
  });
}

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const chunks = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('too_large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/feedback') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return reply(405, 'method');
    if (request.headers.get('Origin') !== url.origin) return reply(403, 'origin');
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return reply(415, 'content_type');
    if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return reply(413, 'too_large');

    let fields;
    try {
      fields = await readBody(request);
    } catch (error) {
      return reply(error.message === 'too_large' ? 413 : 400, 'invalid');
    }
    if (!fields || typeof fields !== 'object') return reply(400, 'invalid');
    const limits = {author: 100, subject: 150, message: 5000};
    const values = {};
    for (const [key, limit] of Object.entries(limits)) {
      if (typeof fields[key] !== 'string') return reply(400, 'invalid');
      values[key] = fields[key].trim();
      if (!values[key] || values[key].length > limit) return reply(400, 'invalid');
    }
    if (/[\r\n\x00-\x1f\x7f]/.test(values.author + values.subject)) return reply(400, 'invalid');
    if (!env.FEEDBACK_TO || !env.FEEDBACK_FROM || !env.EMAIL || !env.FEEDBACK_RATE_LIMITER) return reply(503, 'unavailable');

    try {
      // Anonymous feedback is limited per network address; no address is logged.
      const {success} = await env.FEEDBACK_RATE_LIMITER.limit({key: 'feedback:' + (request.headers.get('CF-Connecting-IP') || 'local')});
      if (!success) return reply(429, 'rate_limit');
      const text = `AINARIUM — повідомлення авторам\n\nАвтор: ${values.author}\nТема: ${values.subject}\n\n${values.message}`;
      await env.EMAIL.send({
        to: env.FEEDBACK_TO,
        from: {email: env.FEEDBACK_FROM, name: 'AINARIUM — зворотний зв’язок'},
        subject: `AINARIUM: ${values.subject}`,
        text,
        html: `<div style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</div>`
      });
      return reply(200);
    } catch (error) {
      console.error(JSON.stringify({event: 'feedback_send_failed', code: error.code || 'unknown'}));
      return reply(502, 'delivery');
    }
  }
};
