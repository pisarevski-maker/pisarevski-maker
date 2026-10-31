import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

const origin = 'https://example.com';
const valid = {author: 'Тестовий автор', subject: 'Перевірка', message: 'Людина задумує. AI допомагає втілити.'};
function request(body = valid, headers = {}, method = 'POST') {
  return new Request(origin + '/api/feedback', {
    method,
    headers: {Origin: origin, 'Content-Type': 'application/json', ...headers},
    ...(method === 'POST' ? {body: typeof body === 'string' ? body : JSON.stringify(body)} : {})
  });
}
function environment(send = async () => ({messageId: 'test-message'})) {
  return {
    FEEDBACK_TO: 'owner@example.com', FEEDBACK_FROM: 'feedback@example.com',
    EMAIL: {send}, FEEDBACK_RATE_LIMITER: {limit: async () => ({success: true})},
    ASSETS: {fetch: async () => new Response('asset')}
  };
}

test('sends only to the server recipient and escapes submitted HTML', async () => {
  let sent;
  const response = await worker.fetch(request({...valid, to: 'outsider@example.com', message: '<script>alert(1)</script>'}), environment(async message => {sent = message;}));
  assert.equal(response.status, 200);
  assert.equal(sent.to, 'owner@example.com');
  assert.equal(sent.from.email, 'feedback@example.com');
  assert.match(sent.html, /&lt;script&gt;/);
  assert.doesNotMatch(sent.html, /<script>/);
  assert.equal((await response.json()).ok, true);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('waits for the email provider before returning success', async () => {
  let release;
  let started;
  const sending = new Promise(resolve => {started = resolve;});
  const provider = new Promise(resolve => {release = resolve;});
  let finished = false;
  const result = worker.fetch(request(), environment(() => {started(); return provider;})).then(response => {finished = true; return response;});
  await sending;
  assert.equal(finished, false);
  release({messageId: 'accepted'});
  assert.equal((await result).status, 200);
});

test('rejects invalid input before sending mail', async () => {
  let sends = 0;
  const env = environment(async () => {sends++;});
  for (const body of ['{broken', null, {...valid, author: ' '}, {...valid, message: 'x'.repeat(5001)}, {...valid, subject: 'Injected\r\nBcc: other@example.com'}, {...valid, author: 123}]) {
    const response = await worker.fetch(request(body), env);
    assert.equal(response.status, 400);
  }
  assert.equal(sends, 0);
});

test('bounds streamed bodies, including requests without Content-Length', async () => {
  const payload = new TextEncoder().encode('x'.repeat(32769));
  const stream = new ReadableStream({start(controller) {controller.enqueue(payload); controller.close();}});
  const req = new Request(origin + '/api/feedback', {method: 'POST', body: stream, duplex: 'half', headers: {Origin: origin, 'Content-Type': 'application/json'}});
  assert.equal((await worker.fetch(req, environment())).status, 413);
  assert.equal((await worker.fetch(request(valid, {'Content-Length': '32769'}), environment())).status, 413);
});

test('rejects other origins, content types, and methods', async () => {
  assert.equal((await worker.fetch(request(valid, {Origin: 'https://other.example'}), environment())).status, 403);
  assert.equal((await worker.fetch(request(valid, {'Content-Type': 'text/plain'}), environment())).status, 415);
  assert.equal((await worker.fetch(request(valid, {}, 'GET'), environment())).status, 405);
});

test('rate limiting and missing configuration never report success', async () => {
  const env = environment();
  env.FEEDBACK_RATE_LIMITER.limit = async () => ({success: false});
  assert.equal((await worker.fetch(request(), env)).status, 429);
  delete env.FEEDBACK_TO;
  assert.equal((await worker.fetch(request(), env)).status, 503);
});

test('provider failures return a generic error without private content', async t => {
  t.mock.method(console, 'error', () => {});
  const response = await worker.fetch(request(), environment(async () => {throw new Error('private provider failure');}));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {ok: false, error: 'delivery'});
});

test('static requests continue to use the assets binding', async () => {
  const response = await worker.fetch(new Request(origin + '/gallery'), environment());
  assert.equal(await response.text(), 'asset');
});
