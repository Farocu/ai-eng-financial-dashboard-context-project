---
title: Data Formatting, Environment Contracts & Dashboard DX
slug: data-formatting-and-env-contracts
---

# Data Formatting, Environment Contracts & Dashboard DX

> Skill específica del proyecto. Ninguna skill comunitaria (vercel-react-best-practices, addyosmani/accessibility) cubre estas convenciones porque pertenecen a la semántica de datos del negocio, no a genéricos de UI/rendimiento.

---

## Objeto

Garantizar que cualquier contribución al dashboard financiero respete las convenciones de representación de datos, contratos de entorno, coherencia frontend-backend y calidad pre-merge que las skills comunitarias no cubren.

---

## Inputs

| # | Input | Fuente | Formato |
|---|-------|--------|---------|
| I1 | Código fuente del frontend | `frontend/src/**/*.tsx`, `frontend/src/**/*.ts` | TypeScript 6, React 19 |
| I2 | Código fuente del backend | `backend/app/routes.py` | Python 3.13, FastAPI, Pydantic |
| I3 | Datos mock/simulados | `backend/app/routes.py::generate_mock_movements` | Seed `42`, instancia `random.Random` aislada |
| I4 | Variables de entorno del frontend | `import.meta.env.VITE_API_BASE_URL` | String vacío por defecto |
| I5 | Variables de entorno del backend | `CORS_ALLOWED_ORIGINS` (desde `os.environ`) | Lista separada por comas |
| I6 | Pruebas existentes | `frontend/src/lib/financial-utils.test.ts`, `backend/tests/test_routes.py` | Vitest 4, pytest 8+ |
| I7 | Configuración de build | `frontend/package.json` script `build` | `tsc -b && vite build` |
| I8 | Fechas generadas por backend | `date.today()` en `generate_mock_movements` | ISO `YYYY-MM-DD` |
| I9 | Fecha mostrada en cabecera | `frontend/src/App.tsx` prop `period` | String literal `"2024 - Full Year"` |
| I10 | Convención de commits existente | Historial de git en `main` | Conventional Commits (no documentado formalmente) |

---

## Proceso

### P1. Verificar formateo de datos financieros

```
al revisar(frontend/src/lib/financial-utils.ts):
  assert formatCurrency usa Intl.NumberFormat con currency USD y 0 decimales
  assert formatPercent usa value.toFixed(1) + "%"
  assert NO existe otro formateador monetario en el frontend

al revisar(kpi-card.tsx):
  assert los valores monetarios tienen clase "tabular-nums"
```

### P2. Verificar contrato de entorno

```
al revisar(frontend/src/App.tsx):
  assert fetch usa import.meta.env.VITE_API_BASE_URL con ?? ""

al revisar(frontend/):
  si existe nueva variable de entorno:
    assert .env.example existe y la documenta
    assert ImportMetaEnv en vite-env.d.ts tiene el tipo

al revisar(docker-compose.yml):
  assert CORS_ALLOWED_ORIGINS no es "*"
  assert el default es http://localhost:5173
```

### P3. Verificar determinismo de datos

```
al revisar(backend/app/routes.py):
  para cada endpoint GET:
    assert generate_mock_movements usa random.Random(seed=42)
    assert NO usa random.seed(seed) global

al revisar(backend/tests/test_routes.py):
  assert existe test que verifica reproducibilidad con seed fijo
  assert existe test que verifica que NO muta el RNG global
```

### P4. Verificar coherencia temporal frontend-backend

```
al revisar(backend/app/routes.py::generate_mock_movements):
  assert fechas derivadas de date.today() (año dinámico)

al revisar(frontend/src/App.tsx):
  si period es string literal ("2024 - Full Year"):
    emitir WARN: período hardcodeado no coincide con backend dinámico

al revisar(frontend/src/lib/mock-data.ts):
  si archivo existe y no se importa en App.tsx:
    emitir WARN: datos huérfanos sin uso en UI
```

### P5. Verificar agregación frontend vs backend

```
al revisar(frontend/src/lib/financial-utils.ts::computeMonthlyData):
  identificar: agrupa por YYYY-MM, calcula income/outcome/profitPercent

al revisar(backend/app/routes.py::summarize_movements):
  identificar: agrupa por YYYY-MM, calcula income/outcome/net

si ambos existen y frontend consume endpoint de resumen:
  assert existe prueba de equivalencia (mismo input → mismos totales)
sino:
  NOTA: duplicación detectada pero sin riesgo inmediato
```

### P6. Verificar pipeline de calidad

```
al revisar(raíz del repo):
  assert NO existe .github/workflows/*.yml -> GAP: sin CI
  assert NO existe .husky/pre-commit -> GAP: sin hooks

al revisar(frontend/package.json):
  assert "build" ejecuta tsc -b (type check + build)

al ejecutar_validación():
  ejecutar: cd frontend && npm test
  ejecutar: cd backend && pytest
  ejecutar: docker compose config --quiet
  assert todos pasan
```

### P7. Verificar convención de commits

```
al revisar(git log --oneline -5):
  para cada mensaje:
    assert formato /^(feat|fix|refactor|docs|chore)\(\w+\):/
    si scope no está en [frontend, backend, infra, rules, memory-bank]:
      emitir WARN: scope no documentado
```

### P8. Verificar convenciones de componentes UI

```
al revisar(frontend/src/components/**/*.tsx):
  assert NO export default (usar export nombrado)
  assert props tipadas con interfaz dedicada
  assert className usa cn() de @/lib/utils
  si componente tiene estado loading:
    assert aria-busy presente en skeleton
    si empty state:
      assert role="status" con aria-live="polite"
  assert nombre archivo en kebab-case
  assert directorio coincide con tipo (ui/ vs dashboard/)
```

---

## Outputs

| # | Output | Formato | Destino |
|---|--------|---------|---------|
| O1 | Validación de formato monetario | Aprobado / Rechazado con archivo y línea | Reporte al agente |
| O2 | Validación de contrato de entorno | Aprobado / Rechazado + `.env.example` actualizado si aplica | Reporte + `frontend/.env.example` |
| O3 | Validación de determinismo | Aprobado / Rechazado con referencia al test | Reporte al agente |
| O4 | Advertencia de coherencia temporal | `WARN` con archivo y línea | Reporte al agente |
| O5 | Diagnóstico de agregación duplicada | Lista de funciones + si existe prueba de equivalencia | Reporte al agente |
| O6 | Diagnóstico de pipeline | Lista de gaps: CI ausente, hooks ausentes | Reporte al agente |
| O7 | Validación de commits | Aprobado / `WARN` si no sigue Conventional Commits | Reporte al agente |
| O8 | Validación de componentes | Aprobado / Rechazado con lista de incumplimientos | Reporte al agente |
| O9 | Resumen de cambios | Markdown con tabla de criterios | `memory-bank/project-context.md` |

---

## Criterios de Aceptación

### CA1 — Formato monetario
```
Dado un componente que muestra un valor monetario en la UI
 Cuando se renderiza con datos
 Entonces el número debe usar formatCurrency() (0 decimales, USD)
  Y no debe usar Intl.NumberFormat con otra configuración
  Y el dígito debe tener clase "tabular-nums"
```

### CA2 — Formato de porcentaje
```
Dado un componente que muestra un porcentaje en la UI
 Cuando se renderiza con datos
 Entonces debe usar formatPercent() (1 decimal, sufijo "%")
  Y no debe usar Intl.NumberFormat
```

### CA3 — Contrato de entorno
```
Dado que el frontend necesita conectarse a la API
 Cuando se ejecuta en desarrollo (Vite proxy)
  Entonces VITE_API_BASE_URL debe ser "" (string vacío)
  Y el fetch debe resolver a import.meta.env.VITE_API_BASE_URL ?? ""
 Cuando se despliega sin proxy
  Entonces debe existir .env.example documentando la variable
  Y debe existir tipo en vite-env.d.ts
```

### CA4 — Determinismo de datos
```
Dado que el backend genera datos mock
 Cuando se llama a cualquier endpoint GET
  Entonces debe usar generate_mock_movements(seed=42)
  Y debe usar random.Random(seed) (instancia aislada)
  Y debe pasar el test de reproducibilidad
```

### CA5 — Coherencia temporal
```
Dado que el backend genera fechas desde date.today()
 Cuando la cabecera muestra el período
  Entonces no debe ser un string literal fijo
  O debe existir un issue/documento que justifique la desconexión
```

### CA6 — Agregación sin duplicación
```
Dado que existe lógica de agregación en frontend y backend
 Cuando se añade un endpoint de resumen que el frontend consume
  Entonces debe existir una prueba de equivalencia
  O debe definirse qué lado es autoritativo
```

### CA7 — Pipeline de calidad
```
Dado un cambio listo para merge
 Cuando se ejecuta validación local
  Entonces debe pasar: npm test, npm run build (frontend)
  Y debe pasar: pytest (backend)
  Y debe pasar: docker compose config --quiet
  Y no debe reducir el número de tests pasando (sin justificación)
```

### CA8 — Convención de commits
```
Dado un commit en el historial
 Cuando se inspecciona el mensaje
  Entonces debe seguir /^(feat|fix|refactor|docs|chore)\(\w+\):/
  Y el scope debe pertenecer al conjunto documentado
```

### CA9 — Convención de componentes
```
Dado un nuevo componente en frontend/src/components/
 Cuando se revisa su implementación
  Entonces debe tener export nombrado (no default)
  Y props con interfaz dedicada
  Y className usando cn()
  Y nombre de archivo en kebab-case
  Y directorio en ui/ o dashboard/
```

---

## Evidencia del repositorio

| Criterio | Archivo | Línea/Evidencia |
|----------|---------|-----------------|
| CA1 | `frontend/src/lib/financial-utils.ts` | `minimumFractionDigits: 0, maximumFractionDigits: 0` |
| CA1 | `frontend/src/components/dashboard/kpi-card.tsx` | `className="... tabular-nums ..."` |
| CA2 | `frontend/src/lib/financial-utils.ts` | `value.toFixed(1) + '%'` |
| CA3 | `frontend/src/App.tsx` | `import.meta.env.VITE_API_BASE_URL ?? ""` |
| CA3 | `docker-compose.yml` | `CORS_ALLOWED_ORIGINS: \${CORS_ALLOWED_ORIGINS:-http://localhost:5173}` |
| CA4 | `backend/app/routes.py` | `generate_mock_movements(seed=42)`, `random.Random(seed)` |
| CA4 | `backend/tests/test_routes.py` | `test_generate_mock_movements_is_reproducible...` |
| CA5 | `frontend/src/App.tsx` | `period="2024 - Full Year"` |
| CA5 | `backend/app/routes.py` | `date.today()` |
| CA5 | `frontend/src/lib/mock-data.ts` | Archivo completo sin imports en UI |
| CA6 | `frontend/src/lib/financial-utils.ts` | `computeMonthlyData()` |
| CA6 | `backend/app/routes.py` | `summarize_movements(group_by="month")` |
| CA7 | `frontend/package.json` | `"build": "tsc -b && vite build"` |
| CA8 | `git log` | Commits: `refactor(frontend):`, `feat(frontend):`, `docs(memory-bank):` |
| CA9 | `frontend/src/components/dashboard/kpi-card.tsx` | `export const KPICard = memo(...)` |
| CA9 | `frontend/src/lib/utils.ts` | `twMerge(clsx(inputs))` |

---

## Historial de cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-11-17 | Creación inicial con 9 criterios de aceptación | Agente |