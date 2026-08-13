const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

const { listFiles, showFile, createServer } = require('../agent/runner');

function mktemp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-agent-'));
  return dir;
}

test('listFiles and showFile work on temp dir', () => {
  const dir = mktemp();
  const fn = 'hello.txt';
  fs.writeFileSync(path.join(dir, fn), 'world', 'utf8');
  const files = listFiles(dir);
  expect(files).toContain(fn);
  const content = showFile(fn, dir);
  expect(content).toBe('world');
});

test('HTTP API /list and /show', async () => {
  const dir = mktemp();
  const fn = 'index.txt';
  fs.writeFileSync(path.join(dir, fn), 'index-content', 'utf8');

  const server = createServer(0, dir);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const get = (path) => new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });

  const listRes = await get('/list');
  expect(listRes.status).toBe(200);
  expect(listRes.body).toContain(fn);

  const showRes = await get(`/show?file=${fn}`);
  expect(showRes.status).toBe(200);
  expect(showRes.body).toBe('index-content');

  server.close();
});
