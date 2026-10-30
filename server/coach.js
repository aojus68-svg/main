// Minimal coach server. Keeps your API key off the browser.
//   ANTHROPIC_API_KEY=sk-... node server/coach.js
// Then set VITE_COACH_URL=http://localhost:8787 for the app.
import http from 'node:http';
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.COACH_MODEL || 'claude-sonnet-5-5';
const CORS = { 'access-control-allow-origin': process.env.ALLOW_ORIGIN || '*', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
const hits = new Map(); // naive per-IP rate limit: 20 requests per minute
http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  const ip = req.socket.remoteAddress; const now = Date.now(); const h = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (h.length >= 20) { res.writeHead(429, CORS); return res.end('{"error":"rate_limited"}'); }
  hits.set(ip, [...h, now]);
  let body = ''; for await (const c of req) { body += c; if (body.length > 20000) break; }
  try {
    const { question, context, history = [] } = JSON.parse(body);
    const system = (context && context.language === 'Simplified Chinese' ? 'Reply in Simplified Chinese. ' : '') + 'You are the friendly coach inside ASCEND, a gamified fitness app. Reply in plain text under 120 words with specific, practical suggestions. Never recommend extreme dieting, long fasts or targets under 1,500 kcal. You are not a doctor: for pain, medical conditions or medication, tell the player to ask a professional. Player data: ' + JSON.stringify(context);
    const messages = [...history.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content).map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) })), { role: 'user', content: String(question).slice(0, 500) }];
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: MODEL, max_tokens: 400, system, messages }) });
    const j = await r.json();
    res.writeHead(r.ok ? 200 : 502, CORS); res.end(JSON.stringify({ answer: j.content?.[0]?.text || '' }));
  } catch { res.writeHead(400, CORS); res.end('{"error":"bad_request"}'); }
}).listen(process.env.PORT || 8787, () => console.log('coach server on', process.env.PORT || 8787));
