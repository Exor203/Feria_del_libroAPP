const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
process.loadEnvFile(path.join(__dirname, '.env'));
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const accessToken = process.env.LOCAL_CHAT_TOKEN;
if (!apiKey || !accessToken) { console.error('Falta configurar GEMINI_API_KEY o LOCAL_CHAT_TOKEN en server/.env.'); process.exit(1); }
if (!/^[a-zA-Z0-9.-]+$/.test(model)) throw new Error('Modelo inválido.');
const mobile = path.resolve(__dirname, '../mobile');
const build = spawnSync(process.execPath, [path.join(mobile, 'node_modules/typescript/bin/tsc'), path.join(mobile, 'src/services/assistantPolicy.ts'), '--module', 'commonjs', '--target', 'ES2022', '--skipLibCheck', '--rootDir', path.join(mobile, 'src'), '--outDir', path.join(__dirname, '.generated')], { encoding: 'utf8' });
if (build.status !== 0) { console.error('No se pudo preparar el contexto local del asistente.'); process.exit(1); }
const { assistantInstructions, conversationHistory, validateMessage } = require('./.generated/services/assistantPolicy');
let busy = false;
let requests = 0;
let started = Date.now();
let last = 0;
function reply(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); }
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') return reply(res, 200, { ready: true, provider: 'Gemini' });
  if (req.url !== '/chat' || req.method !== 'POST') return reply(res, 404, { error: 'Ruta no disponible.' });
  if (req.headers.authorization !== `Bearer ${accessToken}`) return reply(res, 401, { error: 'No se autorizó esta conexión al servidor local.' });
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') return reply(res, 415, { error: 'Formato de consulta inválido.' });
  let size = 0;
  const chunks = [];
  try {
    for await (const chunk of req) { size += chunk.length; if (size > 20000) { reply(res, 413, { error: 'La conversación es demasiado larga.' }); return; } chunks.push(chunk); }
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return reply(res, 400, { error: 'Consulta inválida.' }); }
    if (typeof body.message !== 'string') return reply(res, 400, { error: 'Falta la consulta.' });
    const invalid = validateMessage(body.message);
    if (invalid) return reply(res, 400, { error: invalid });
    const history = body.history ?? [];
    if (!Array.isArray(history) || history.length > 12 || history.some(turn => !turn || !['user', 'model'].includes(turn.role) || typeof turn.text !== 'string' || turn.text.length > 3000)) return reply(res, 400, { error: 'Historial inválido.' });
    const now = Date.now();
    if (now - started > 3600000) { requests = 0; started = now; }
    if (busy || now - last < 3000 || requests >= 20) return reply(res, 429, { error: 'Se alcanzó el límite de consultas de la prueba. Esperá y reintentá.' });
    busy = true; requests++; last = now;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, signal: AbortSignal.timeout(45000),
        body: JSON.stringify({ systemInstruction: { parts: [{ text: assistantInstructions() }] }, contents: [...conversationHistory(history).map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })), { role: 'user', parts: [{ text: body.message.trim() }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: "LOW" } } }),
      });
      const data = await response.json();
      if (!response.ok) {
        const status = response.status;
        // Never forward upstream details, request headers or API credentials to the phone/log.
        const error = status === 429 ? 'Se alcanzó la cuota gratuita de Gemini. Esperá y reintentá.' : status === 404 ? 'El modelo configurado no está disponible.' : status === 400 || status === 401 || status === 403 ? 'Gemini rechazó la configuración de acceso. Revisá la clave y los permisos del proyecto.' : 'Gemini no pudo responder ahora.';
        console.log(`Gemini rechazó la solicitud: HTTP ${status}, estado ${String(data.error?.status || 'desconocido')}.`);
        return reply(res, status === 429 ? 429 : 502, { error });
      }
      const text = data.candidates?.[0]?.content?.parts?.filter(part => part.text && !part.thought).map(part => part.text).join('\n').trim();
      if (!text) return reply(res, 502, { error: 'La IA no generó texto. Probá reformular la consulta.' });
      reply(res, 200, { text, provider: 'Gemini', demoContent: true });
    } finally { busy = false; }
  } catch (error) {
    if (res.writableEnded) return;
    reply(res, 503, { error: error.name === 'TimeoutError' ? 'La IA tardó demasiado. Probá otra vez.' : 'No pudimos conectarnos con Gemini. Revisá internet.' });
  }
});
server.requestTimeout = 55000;
server.listen(Number(process.env.PORT || 8787), '0.0.0.0', () => console.log(`Servidor local Gemini listo en puerto ${process.env.PORT || 8787}. Clave privada cargada; no se muestra ni se envía al teléfono.`));
