# Локальный ИИ-агент (демо)

Файлы агента:

- `agents/ai-agent.agent.md` — метаданные агента
- `agent/runner.js` — простой раннер на Node.js

Требования:

- Node.js (рекомендуется v14+)

Примеры команд (PowerShell):

```powershell
# перечислить файлы
& .\agent\runner.ps1 list

# показать файл
& .\agent\runner.ps1 show index.html

# запустить HTTP-сервер (по умолчанию порт 8080)
& .\agent\runner.ps1 serve
```

HTTP API:

- `GET /list` — возвращает список файлов (text/plain)
- `GET /show?file=<имя>` — возвращает содержимое файла (text/plain)

Логи: `agent/logs/agent.log` — содержит временные метки и команды.

Node.js раннер:

Если у вас установлен Node.js, можно использовать `agent/runner.js` (функционал ограничен базовыми командами). Для тестирования Node.js-раннера установите Node.js и выполните:

```bash
node agent/runner.js list
node agent/runner.js show index.html
```
