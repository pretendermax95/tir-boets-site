# tir-boets-site

Локальный сайт и демонстрационный раннер агента.

## Быстрый старт

```powershell
cd site
# запустить локально
node agent/runner.js serve

# запустить тесты
npm ci
npm test
```

## Деплой на GitHub Pages

Проект настроен для автоматического деплоя на GitHub Pages: при пуше в ветку `main` срабатывает workflow `.github/workflows/deploy-pages.yml`. Он запускает тесты и, при успехе, публикует содержимое репозитория в ветку `gh-pages`.

Если вы хотите включить Pages вручную:

1. Откройте репозиторий на GitHub: https://github.com/pretendermax95/tir-boets-site
2. Перейдите в Settings -> Pages
3. В Source выберите `gh-pages` (если используется) или `main`/root, затем Save.

Примечания:
- Workflow использует `${{ secrets.GITHUB_TOKEN }}` (предоставляется автоматически), дополнительных секретов не требуется для стандартного деплоя.
- Если вы хотите деплоить в другую ветку или использовать пользовательский токен, добавьте секрет `GH_PAT` в Settings -> Secrets и измените workflow.
