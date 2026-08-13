#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');

const cmd = process.argv[2] || 'help';

function ensureLogsDir(baseDir) {
  const logDir = path.join(baseDir || process.cwd(), 'agent', 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  return logDir;
}

function log(msg, baseDir) {
  try {
    const logDir = ensureLogsDir(baseDir);
    const logFile = path.join(logDir, 'agent.log');
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `${time}\t${msg}\n`, 'utf8');
  } catch (e) {
    // ignore logging errors
  }
}

function listFiles(cwd) {
  const dir = cwd || process.cwd();
  const files = fs.readdirSync(dir);
  return files;
}

function showFile(file, cwd) {
  if (!file) throw new Error('Укажите имя файла для команды show');
  const dir = cwd || process.cwd();
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) throw new Error(`Файл не найден: ${file}`);
  return fs.readFileSync(p, 'utf8');
}

function createServer(port = 8080, baseDir) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === '/list') {
      const items = listFiles(baseDir).join('\n');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(items);
      log('HTTP /list', baseDir);
      return;
    }
    if (url.pathname === '/show') {
      const file = url.searchParams.get('file');
      if (!file) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Missing file parameter');
        return;
      }
      try {
        const content = showFile(file, baseDir);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(content);
        log(`HTTP /show file=${file}`, baseDir);
      } catch (e) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(e.message);
      }
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  });
  return server;
}

function help() {
  console.log('AI Agent runner — доступные команды:');
  console.log('  list            — перечислить файлы в рабочей директории');
  console.log('  show <file>     — вывести содержимое файла');
  console.log('  serve [port]    — запустить HTTP-сервер (эндпоинты /list, /show?file=)');
}

if (require.main === module) {
  if (cmd === 'list') {
    const files = listFiles();
    console.log('Files in project:');
    files.forEach(f => console.log('-', f));
  } else if (cmd === 'show') {
    try {
      const content = showFile(process.argv[3]);
      console.log(content);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  } else if (cmd === 'serve') {
    const port = parseInt(process.argv[3], 10) || 8080;
    const server = createServer(port);
    server.listen(port, () => {
      console.log(`HTTP server listening on http://localhost:${port}/`);
    });
  } else {
    help();
  }
}

module.exports = { listFiles, showFile, createServer, log };
