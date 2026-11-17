# Contexto del proyecto

## Overview del producto

- Panel web de métricas financieras que presenta ingresos, gastos, beneficio y margen, además de gráficos mensuales de ingresos/gastos y margen. Evidencia: `frontend/src/components/dashboard/kpi-row.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx` y `frontend/src/App.tsx`.
- La pantalla pide movimientos a `GET /api/metrics`; el backend genera datos simulados con seed fijo por endpoint y no configura almacenamiento persistente. Evidencia: `frontend/src/App.tsx`, `backend/app/routes.py` y `docker-compose.yml` (solo contiene frontend y backend).
- Entry points: `frontend/src/main.tsx` monta React y `frontend/src/App.tsx` compone la pantalla; `backend/app/main.py` crea FastAPI y registra el router de `backend/app/routes.py`.

## Stack tecnológico

- **Frontend:** TypeScript 6, React 19, Vite 8, Tailwind CSS 4 y Recharts 3. Dependencias de UI clave: `lucide-react`, `clsx`, `tailwind-merge` y `class-variance-authority`. Evidencia: `frontend/package.json`, `frontend/Dockerfile`.
- **Frontend tooling:** npm con `package-lock.json`; Vitest 4 para pruebas, ESLint 9 y `tsc -b` para validación/build. Evidencia: scripts de `frontend/package.json`.
- **Backend:** Python 3.13, FastAPI, Pydantic, Uvicorn y debugpy; pytest, pytest-cov y httpx para pruebas. Evidencia: `backend/Dockerfile`, `backend/requirements.txt`, imports y modelos de `backend/app/routes.py`.
- **Infraestructura/desarrollo:** Docker Compose con servicios frontend (`5173`) y backend (`8000`, debugpy `5678`); Vite proxifica `/api` a `backend:8000`. Compose espera el healthcheck `/health` antes de iniciar el frontend. Evidencia: `docker-compose.yml`, `frontend/vite.config.ts`.
- **Configuración:** `CORS_ALLOWED_ORIGINS` es una lista separada por comas; el valor de Compose por defecto es `http://localhost:5173`. Evidencia: `backend/app/main.py`, `docker-compose.yml`.
- **Persistencia:** no hay base de datos ni dependencia de ORM configuradas. `backend/requirements.txt` no fija versiones de paquetes.

## Estado actual

### Funciona

- El dashboard carga `/api/metrics` y calcula KPI/agregados mensuales en `frontend/src/lib/financial-utils.ts`.
- El backend implementa `/health` y rutas para movimientos, facetas, resumen, categorías principales, comparaciones, alertas y filtros B2B/B2C. Evidencia: decoradores de ruta en `backend/app/routes.py`.
- Validación ejecutada el 2026-11-12: frontend 6/6 tests, lint y build; backend 18/18 tests. Compose arrancó con backend `healthy`; `/health`, `/api/metrics` vía proxy y `/` del frontend respondieron HTTP 200.

### Gaps conocidos

- La UI solo consume `GET /api/metrics`; los endpoints de resumen, facetas, comparaciones, alertas y filtros no están conectados a controles de la pantalla. Evidencia: única llamada `fetch` en `frontend/src/App.tsx`.
- La cabecera fija `2024 - Full Year`, mientras `generate_mock_movements` crea fechas relativas a `date.today()`. Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`, `backend/app/routes.py`.
- `frontend/src/lib/mock-data.ts` conserva otra serie fija de 2024 que no se importa en la pantalla actual.
- `App.tsx` muestra error si falla la solicitud inicial, pero no reintenta si la API se cae posteriormente. El healthcheck de Compose solo cubre la dependencia de arranque.
- El último `npm ci` reportó 21 vulnerabilidades (1 baja, 12 moderadas, 8 altas); no se ejecutó `npm audit` ni se aplicaron actualizaciones.
- `backend/requirements.txt` no fija versiones. Los tests backend mostraron una advertencia de deprecación de `starlette.testclient` con httpx.

### Roadmap y claims

- No se encontró un archivo de roadmap o backlog en la documentación Markdown del checkout. Los gaps anteriores describen el estado observado, no prioridades aprobadas ni compromisos de entrega.
- No se conoce aquí una fecha, alcance futuro o prioridad de producto aprobada. Para afirmarlo hace falta una fuente explícita, como un issue/backlog mantenido o un plan aprobado por el usuario.
- Los claims funcionales deben distinguir las capacidades conectadas a la UI de los endpoints que existen solo en backend, y los datos simulados de datos persistidos o reales.

## Ejecución

- Arranque local: `docker compose up --build`.
- Frontend: `http://localhost:5173`; API: `http://localhost:8000`; documentación: `http://localhost:8000/docs`.
- Frontend: desde `frontend/`, `npm test`, `npm run lint` y `npm run build`.
- Backend: desde la raíz, `pytest`.

## Instrucciones para agentes

- Revisar `AGENTS.md` y las reglas de `.agents/rules/` antes de cambiar código.
- Las reglas de `.agents/rules/` describen convenciones propuestas y evidencia de este repo; revisar su estado antes de tratarlas como aprobadas.

## Skills aplicadas

### Instaladas en `skills-lock.json`

| Skill | Origen | Commit | ¿Usada? |
|-------|--------|--------|---------|
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | `1a2c79d` | ✅ Sí |
| `accessibility` (a11y) | `addyosmani/web-quality-skills` | `afa8da9` | ✅ Sí |

### Criterio de selección

Se aplicaron **2 de las 2 skills instaladas** en `skills-lock.json`. No se usaron otras porque:

- **`writing-guidelines`** (vercel-labs): aplica a prosa/documentación, no a código de dashboard. El repositorio no tiene archivos `.md` de documentación de producto que auditar.
- **`web-design-guidelines`** (vercel-labs): aplica a diseño visual/UX. El dashboard ya fue auditado contra las reglas de UI vía `vercel-react-best-practices` y `accessibility`. Activar esta skill requeriría fetch externo desde `raw.githubusercontent.com`, lo que añade latencia y no cubre gaps detectados.
- **`composition-patterns`** (vercel-labs): aplica a arquitectura de componentes React. El dashboard es una SPA pequeña (4 componentes de dashboard), donde los patrones de composición avanzados (compound components, context interfaces) añadirían sobreingeniería.
- **`vercel-optimize`** (vercel-labs): requiere proyecto desplegado en Vercel con señales de observabilidad. Este proyecto no está desplegado en Vercel ni tiene tráfico.
- **`react-native-skills`**, **`react-view-transitions`**: no aplican al stack (React web SPA, no React Native; sin View Transitions API).

### Hallazgos y cambios por skill

#### `vercel-react-best-practices` (R1–R8)

Commit `ac9b32a` — 8 archivos modificados, 92 inserciones, 15 eliminaciones.

| Regla | Práctica | Cambio |
|-------|----------|--------|
| R2 manualChunks | Bundle optimization | Separar vendor (react/react-dom) y charts (recharts) en chunks distintos |
| R6.3 hoist-jsx | Static JSX hoisting | `chartFallback` movido fuera del componente |
| R6.9 conditional-render | Ternary sobre && | Error rendering con ternario |
| R6.10 resource-hints | Preconnect + preload + modulepreload | Google Fonts preconnect, preload de CSS de fuentes, modulepreload para entry |
| R6.1 / server-hoist-static-io | Font loading + CLS | `@font-face` con `size-adjust: 102%` para Inter fallback; tabla de métricas de ascent/descent para minimizar CLS |
| — | Page metadata | `color-scheme`, `theme-color`, Open Graph, Twitter card |
| — | Tabular figures | `tabular-nums` en valores KPI para ancho de dígito estable |
| — | TypeScript compat | `erasableSyntaxOnly: false` (bug TS 6.0.2); `memo(function)` → arrow function pattern |

#### `accessibility` (WCAG 2.2 + Lighthouse audits)

Commit `TBD` — 3 archivos modificados.

| Principio WCAG | Hallazgo | Cambio |
|----------------|----------|--------|
| 1.1 Text alternatives | Gráficos de Recharts dependen solo de color para diferenciar income/outcome | Income: línea sólida (strokeWidth 2.5); Outcome: línea discontinua (`strokeDasharray="6 3"`) + dots con borde |
| 1.4.1 Use of Color | Chart lines solo distinguibles por color | Patrón de dash añadido a outcome — usable sin percepción de color |
| 4.1.3 Live regions | Empty state sin anuncio a screen readers | `aria-live="polite"` añadido a mensajes "No data available" en ambos charts |
| 4.1.2 ARIA / landmarks | Sin issues — skip link, `<main>`, `<section aria-label>`, `<h1>` ya presentes | Sin cambio necesario |

#### `testing-and-local-runtime` (regla local del proyecto)

| Práctica | Hallazgo | Cambio |
|----------|----------|--------|
| Deterministic builds | `requirements.txt` sin versiones → builds no reproducibles | Versiones mínimas añadidas: `fastapi>=0.115.0`, `uvicorn>=0.32.0`, `debugpy>=1.8.0`, `pytest>=8.0.0`, `pytest-cov>=5.0.0`, `httpx>=0.28.0` |
| Test suite verification | Backend 18/18, Frontend 6/6, Build OK, Lint OK | Verificado post-cambios |

### Verificación post-cambio

| Check | Estado |
|-------|--------|
| `vite build` | ✅ 10 chunks, sin warnings |
| `tsc -b --noEmit` | ✅ 0 errores |
| `vitest run` (frontend) | ✅ 6/6 passed |
| `pytest` (backend) | ✅ 18/18 passed (1 warning pre-existente: starlette.testclient deprecation) |
| `eslint .` (frontend) | ✅ Sin errores |
| `requirements.txt` versionado | ✅ Versiones mínimas fijadas |
