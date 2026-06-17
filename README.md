# 🚀 NYXN — Automation & Performance Testing Suite

---

## Resumen
Este repositorio contiene la suite de pruebas implementada para la prueba técnica: automatización de pruebas API/E2E con Playwright (TypeScript) y validación de contratos con AJV. Está diseñada para ejecutarse localmente y para integrarse en CI cuando se agreguen los artefactos correspondientes.

---

## Dependencias clave (según `package.json`)
- @playwright/test ^1.61.0 (devDependency)
- ajv ^8.20.0

## Requisitos
- Node.js (LTS)
- npm
- (Opcional) Java y Apache JMeter para pruebas de rendimiento
- (Opcional) Cliente MongoDB para inspección manual de persistencia

---

## Instalación rápida
```bash
npm ci
```

Ejecutar las pruebas:
```bash
npx playwright test
```
Ejecutar una prueba concreta:
```bash
npx playwright test tests/api-orders.spec.ts
```
Abrir reporte HTML:
```bash
npx playwright show-report
```

---

## Contenido y configuración principal
- `playwright.config.ts`
  - `testDir`: `./tests`
  - `reporter`: `html`
  - `baseURL` por defecto: `https://www.demoblaze.com` (configurable)
  - Proyectos: `setup`, `chromium`, `firefox`, `webkit` (uso de `storageState: 'playwright/.auth/user.json'`)

- Carpeta `tests/` con los siguientes archivos relevantes:
  - `tests/api-orders.spec.ts` — mock HTTP local y validación AJV
  - `tests/mocking.spec.ts`
  - `tests/purchase.spec.ts`
  - `tests/example.spec.ts`
  - `tests/auth.setup.ts` — setup inicial

---

## Mocking y validación de contratos
- Implementación: `tests/api-orders.spec.ts` levanta un servidor HTTP local (módulo `http`) que responde a `POST /api/v1/orders` para permitir la ejecución aislada de la prueba.
- El esquema `orderResponseSchema` está definido en la prueba y se valida con AJV (`ajv.compile(...)`). Los errores de validación se registran y hacen fallar la prueba.

---

## Persistencia
- El test incluye ejemplos de consultas para verificar persistencia en distintas bases de datos (Postgres/MySQL/MongoDB). Por defecto la ejecución usa el mock local y no modifica bases externas.
- Ejemplo MongoDB presente en `tests/api-orders.spec.ts`:
```js
// db.orders.find({ client_id: 'NYXN-2026' }).sort({ created_at: -1 }).limit(1).pretty();
```

---

## Rendimiento (referencia)
Este repositorio no incluye planes de carga (`.jmx`). Se documenta a continuación la estrategia de referencia para pruebas de estrés y rendimiento:

- Escenario: 500 usuarios concurrentes
- Rampa: 2 minutos
- Métricas objetivo:
  - P95 (percentil 95) < 400 ms
  - Tasa de errores = 0.0%

Comando de ejecución en modo no‑GUI (cuando exista el plan):
```bash
jmeter -n -t performance/NYXN_Stress_Test.jmx -l performance/results.jtl -e -o performance/dashboard/
```
Los artefactos de ejecución deben conservarse en el pipeline para análisis.

---

## Integración continua (estado)
En el repositorio actual no existe un workflow de GitHub Actions en `.github/workflows/`. Recomendación mínima para un pipeline de CI:
1. `npm ci`
2. `npx playwright test --reporter=html`
3. Subir `playwright-report/` como artefacto con `if: always()`

Ejemplo de paso para subir artefactos:
```yaml
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

---

## Troubleshooting rápido
- Playwright: ver trazas con `DEBUG=pw:api npx playwright test`.
- AJV: revisar `validate.errors` impreso por las pruebas.
- Problemas con `storageState`: comprobar `playwright/.auth/user.json` y rutas en `playwright.config.ts`.

---

