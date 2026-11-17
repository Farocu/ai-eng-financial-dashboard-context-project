# Progreso de skills y cambios verificados

**Última actualización:** 2026-11-17  
**Alcance:** auditoría de performance/accesibilidad anterior y creación/prueba de la skill local de contratos de datos del dashboard. Este archivo registra trabajo realizado; no implica que los gaps identificados sean prioridades de producto.

## Skills aplicadas

| Skill o guía | Origen | Aplicación | Resultado verificado |
|---|---|---|---|
| `vercel-react-best-practices` | `vercel-labs/agent-skills`, commit `1a2c79d` | Auditoría/refactor de React, carga de charts, chunks, JSX estático y recursos | Build del frontend verificado sin advertencias nuevas en la auditoría reportada; commit asociado `ac9b32a` |
| `accessibility` | `addyosmani/web-quality-skills`, commit `afa8da9` | Contraste no dependiente solo del color y anuncios de estados vacíos | Cambios accesibles en gráficos/estados; commit asociado `9c5dd06` |
| `testing-and-local-runtime` | Regla local `.agents/rules/testing-and-local-runtime.md` | Validar suites y configuración de ejecución local | Suites reportadas previamente: Vitest 6/6 y pytest 18/18; se documentó una advertencia de deprecación preexistente de Starlette/httpx |
| `dashboard-data-contracts` | Skill interna de este repositorio, `.skills/dashboard-data-contracts/SKILL.md` | Revisar formatos financieros, fechas/agregaciones, contratos API/env, determinismo y checks proporcionales | Probada en revisión real de `financial-utils.ts` y `financial-utils.test.ts`; verificación frontend actual descrita abajo |

## Skills del ecosistema elegidas y motivo

### `vercel-react-best-practices`

Elegida para performance porque el proyecto es una SPA React/Vite y la skill aporta reglas accionables de código (no solo métricas). Lighthouse CI mide y detecta, pero no sustituye una guía de refactor. `webpack-bundle-analyzer` no es la opción natural para el pipeline Vite/Rolldown. React DevTools Profiler y `why-did-you-render` sirven para diagnóstico runtime/manual, mientras el alcance de aquella revisión era principalmente estático y de build.

### `accessibility`

Elegida para revisar patrones de código WCAG y accesibilidad en JSX; herramientas como axe, WAVE, Lighthouse y Pa11y son útiles para auditoría/detección, pero no reemplazan por sí solas la guía contextual para localizar y corregir en componentes. La skill advierte correctamente que las comprobaciones automatizadas no prueban conformidad WCAG completa.

### Criterio de alcance

Las skills externas se seleccionaron por corresponder a los cambios de React/performance y accesibilidad de la auditoría. Para checks de pruebas, ejecución local y particularidades del API, se utilizó la regla existente del proyecto y luego se creó la skill interna, ya que las skills externas no conocen los contratos concretos de este repositorio.

## Skill interna creada

**Ruta:** `.skills/dashboard-data-contracts/SKILL.md`  
**Descubrimiento del agente:** enlace simbólico `.agents/skills/dashboard-data-contracts` hacia la ruta anterior, e instrucción añadida en `AGENTS.md` para cargar skills locales desde `.skills/`.

**Objetivo:** aplicar y validar los contratos específicos del dashboard sobre formatos financieros, integración tipada React/FastAPI, fechas y agregaciones, datos simulados reproducibles y validación pre-merge.

**Disparadores:** cambios/revisiones de formato de moneda, porcentajes y KPI; contratos de API/tipos; períodos, fechas y agregaciones; generación/seed de datos mock; entorno Vite, CORS o Compose; componentes que muestran esos datos; validación pre-merge de esas áreas.

**Estructura:** objetivo, disparadores, inputs, outputs, procedimiento, criterios de aceptación y formato de reporte. La skill distingue evidencia actual de propuestas/gaps y pide no cambiar comportamiento ajeno al alcance.

## Prueba de la skill en una tarea real

Se cargó la skill y se usó para revisar el área de formateo/agregación financiera existente:

- `frontend/src/lib/financial-utils.ts`: `formatCurrency()` usa USD con 0 decimales; `formatPercent()` usa 1 decimal; agregación mensual agrupa por la parte `YYYY-MM` y ordena cronológicamente.
- `frontend/src/lib/financial-utils.test.ts`: cobertura de KPI, cruce de año, primer día de mes (incluida zona horaria) y formatos.
- Inputs del contrato considerados: tipo `FinancialMovement` y pruebas propietarias de frontend.
- No se realizaron cambios de lógica de producto durante esta revisión.

### Validación ejecutada el 2026-11-17

| Comando | Resultado |
|---|---|
| `cd frontend && npm test` | ✅ 1 archivo, 6/6 pruebas pasaron |
| `cd frontend && npm run lint` | ✅ Pasó, sin errores |
| `cd frontend && npm run build` | ✅ Pasó; TypeScript y Vite/Rolldown, 10 chunks, sin warnings en la salida |
| `git diff --check` | ✅ Pasó en los cambios documentales al momento de verificar |

**Nota de ejecución:** el primer intento de `npm test` se hizo desde la raíz y falló porque el `package.json` está en `frontend/`. Se corrigió la ubicación y se repitieron test, lint y build con éxito.

**No ejecutado en esta prueba de skill:** suite backend y validación Compose, porque la tarea real evaluada fue una revisión de utilidades frontend y no se modificaron backend ni infraestructura.

## Estado documental

- La skill y los cambios de documentación siguen sujetos al estado de Git; no se afirma aquí que estén committeados.
- `.agents/rules/data-formatting-and-env-contracts.md` y las reglas locales contienen propuestas y evidencia. No tratarlas como políticas aprobadas automáticamente.
- No se ejecutaron pruebas backend en la prueba de la skill local.
