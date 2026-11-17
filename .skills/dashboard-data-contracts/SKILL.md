---
name: dashboard-data-contracts
description: "Use when changing or reviewing this dashboard's financial value formatting, API/data contracts between React and FastAPI, date ranges or aggregations, deterministic mock data, Vite/environment/CORS configuration, dashboard component conventions, or pre-merge validation. Do not use for general React performance or accessibility tasks unless they also affect one of these project-specific contracts."
metadata:
  author: project
  version: "1.0.0"
---

# Dashboard Data Contracts

Skill local del dashboard financiero. Complementa `vercel-react-best-practices` y `accessibility`: esas skills cubren patrones generales de React, rendimiento y accesibilidad, pero no conocen los contratos financieros, fechas ni ejecución de este repositorio.

## Objetivo

Aplicar, revisar y validar los contratos específicos del dashboard para que los cambios relacionados con datos financieros mantengan formatos coherentes, integración frontend/backend tipada, fechas y agregaciones definidas, datos simulados reproducibles y checks pre-merge proporcionales al cambio.

Esta skill es una guía de trabajo, no una autorización para cambiar comportamiento fuera del alcance solicitado. No convierte gaps observados ni convenciones propuestas en requisitos de producto o políticas aprobadas. Diferencia explícitamente evidencia actual, propuestas y requisitos de la solicitud.

## Cuándo usarla

Actívala cuando la tarea implique uno o más de estos casos:

- cambiar cómo se presentan cantidades monetarias, porcentajes, KPI o agregaciones financieras;
- cambiar el contrato de `/api/metrics` u otro endpoint usado por el frontend, sus tipos, modelos o transformación de datos;
- cambiar rangos/semántica de fechas, período mostrado, agrupación mensual o cálculos duplicados entre backend y frontend;
- cambiar generación de datos mock, semilla o reproducibilidad;
- añadir/modificar variables de entorno, URL base de API, proxy Vite, CORS o configuración de Compose;
- crear o modificar componentes del dashboard que presenten estos datos o sus estados de carga, error y vacío;
- validar cambios anteriores a merge en las áreas descritas.

No la uses para tareas genéricas de React, optimización de rendimiento o auditoría de accesibilidad que no afecten esos contratos; usa las skills especializadas correspondientes. Si una tarea cruza esos dominios, aplica ambas.

## Inputs

Usa la solicitud y el diff como límites de alcance. Recoge los siguientes inputs solo cuando correspondan:

| Input | Fuente principal | Uso |
|---|---|---|
| Solicitud y diff (obligatorio) | Usuario y cambios de trabajo | Determinar alcance, comportamiento solicitado y archivos afectados |
| Datos/formateadores/agregaciones (si aplica) | `frontend/src/lib/financial-utils.ts` y pruebas | Verificar formatos de moneda/porcentaje y cálculos del cliente |
| Consumo y tipos API (si aplica) | `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts` | Verificar fetch, URL base, estados y contrato TypeScript |
| Modelos, rutas y generador (si aplica) | `backend/app/routes.py` | Verificar parámetros/respuestas, filtros, fechas y semilla |
| Variables y ejecución (si aplica) | `frontend/.env.example`, `frontend/vite.config.ts`, `docker-compose.yml`, `backend/app/main.py` | Verificar entorno, proxy, CORS y arranque |
| Pruebas (según área afectada) | `frontend/src/lib/financial-utils.test.ts`, `backend/tests/test_routes.py` | Elegir y actualizar cobertura del comportamiento cambiado |
| Componentes (si aplica) | `frontend/src/components/` | Comparar con patrones existentes y revisar estados UI pertinentes |
| Comandos de validación (según área) | `frontend/package.json`, instrucciones locales | Ejecutar los checks soportados por el repo |

Si una fuente esperada falta o no es accesible, no inventes su contenido: informa la limitación y usa la fuente más cercana verificable. No amplíes el alcance para revisar áreas no afectadas salvo que la solicitud lo pida.

## Outputs esperados

Al completar una implementación o revisión, comunica los outputs aplicables:

1. **Resultado/cambios:** qué se implementó o revisó y qué contratos fueron afectados. Si fue solo una revisión, indícalo sin sugerir que se modificó código.
2. **Hallazgos:** estado (`cumple`, `gap existente`, `riesgo introducido`, `no aplica` o `bloqueado`), ruta/archivo y efecto relevante. Cita líneas o pruebas cuando ayude a localizarlo.
3. **Validación:** comandos ejecutados y resultado; separa fallos nuevos, fallos preexistentes y checks no ejecutados con motivo.
4. **Seguimiento de contrato:** especifica las actualizaciones requeridas o realizadas en API, tipos, entorno, UI, pruebas o documentación.

No reportes una prueba como pasada si no se ejecutó. No cambies datos, fechas, arquitectura ni mensajes de producto solo para hacer que el estado existente coincida con una guía.

## Procedimiento

### 1. Identificar el contrato afectado

- Revisa la solicitud, el código relacionado y sus pruebas.
- Sigue el dato desde su origen hasta la UI: API/mock → tipo/transformación → componente.
- Identifica comportamiento actual y distingue hechos de gaps/propuestas documentados.

### 2. Aplicar formatos financieros

- Usa `formatCurrency()` para valores monetarios existentes, salvo que el requisito defina explícitamente otra moneda o precisión.
- Usa `formatPercent()` para porcentajes existentes.
- Conserva las opciones y la precisión definidas en `frontend/src/lib/financial-utils.ts`; no crees un formateador paralelo sin motivo documentado y pruebas.
- Mantén `tabular-nums` en cifras KPI cuando corresponda al patrón actual.
- Si cambia precisión, moneda o redondeo, actualiza pruebas para valores normales, negativos y límites relevantes.

### 3. Preservar contratos frontend/backend

- Para un cambio de respuesta o parámetros de API, actualiza modelos/tipos de ambos lados y pruebas de contrato afectadas.
- Comprueba URL base, proxy Vite y allowlist CORS antes de cambiar configuración. Usa `frontend/.env.example` como referencia de variables documentadas; agrega ahí y en los tipos de Vite las variables nuevas que correspondan.
- No uses CORS abierto como sustituto de configuración local/de despliegue.
- Conserva estados de carga, error y vacío cuando cambies el consumo de API; verifica su anuncio accesible si se altera el markup.

### 4. Preservar determinismo y semántica temporal

- Para generación aleatoria reproducible en backend, usa una instancia local `random.Random(seed)`; no cambies estado aleatorio global.
- Al modificar generación o filtros de fechas, prueba repetibilidad, límites de período y coherencia de agregados.
- Compara el período mostrado en la UI con las fechas servidas por backend. En el estado documentado, `App.tsx` muestra `2024 - Full Year`, mientras el backend deriva fechas de `date.today()`; registra esta diferencia como gap existente si no forma parte del cambio solicitado.
- Si una lógica de agregación existe en cliente y servidor, no presupongas equivalencia: define cuál lado es autoritativo o añade una prueba con el mismo input y resultados esperados.

### 5. Revisar componentes dentro del alcance

Al crear o modificar un componente, sigue primero los patrones existentes. Como guía local propuesta, favorece exports nombrados, props tipadas, `cn()` para combinar clases y nombres de archivo kebab-case. Mantén semántica y estados accesibles (por ejemplo, anuncios para estados dinámicos cuando corresponda).

No reescribas componentes no afectados para imponer una convención sin relación con la tarea. Si encuentras divergencia de una propuesta, repórtala como hallazgo, no como defecto automático.

### 6. Ejecutar checks proporcionales al cambio

- Frontend: desde `frontend/`, ejecuta `npm test`, `npm run lint` y `npm run build` para cambios de frontend; para cambios pequeños, explica cualquier check omitido.
- Backend: desde la raíz, ejecuta `pytest` para cambios de API/generación.
- Docker/configuración: ejecuta `docker compose config --quiet` para cambios de Compose, entorno o arranque.
- Si el cambio afecta integración/arranque y el entorno lo permite, verifica el flujo descrito en `.agents/rules/testing-and-local-runtime.md`.
- Informa cualquier fallo preexistente por separado del causado por el cambio.

## Criterios de aceptación

La tarea se acepta cuando se cumplen todos los criterios aplicables al alcance. Marca los demás como `no aplica`; no omitas criterios aplicables sin explicar el motivo.

- **CA1 — Alcance:** se identifican los contratos efectivamente afectados a partir de la solicitud/diff; gaps existentes no se atribuyen al cambio nuevo.
- **CA2 — Formato financiero:** valores cambiados usan los helpers existentes o la excepción está justificada y probada; los casos de formato modificados tienen pruebas actualizadas.
- **CA3 — Contrato API/entorno:** los cambios de API mantienen alineados modelos/tipos/pruebas; los cambios de configuración mantienen coherentes base URL, proxy, CORS y documentación de variables que aplique.
- **CA4 — Determinismo:** cambios de generación usan RNG local aislado y una prueba demuestra la reproducibilidad pertinente.
- **CA5 — Fechas/agregaciones:** cambios de períodos o agrupaciones definen la semántica y prueban límites relevantes; cálculos duplicados no se presumen equivalentes sin prueba o autoridad definida.
- **CA6 — Interfaz afectada:** componentes modificados mantienen estados necesarios de carga/error/vacío y no introducen regresiones semánticas conocidas; se respetan las convenciones de UI existentes sin refactor ajeno al alcance.
- **CA7 — Verificación:** se ejecutan los checks indicados por el procedimiento para el área afectada, o se declara cuáles se omitieron y por qué; resultados y fallos se reportan con precisión.
- **CA8 — Trazabilidad:** toda nueva convención o cambio deliberado de contrato queda documentado en la regla/skill apropiada; las propuestas siguen identificadas como propuestas.

### Formato del reporte

```markdown
## Revisión con Dashboard Data Contracts
- Alcance: [archivos/contratos cubiertos]
- Resultado: [cumple / requiere cambios / parcial]
- Hallazgos:
  - [estado] `ruta`: descripción e impacto
- Validación:
  - `[comando]`: [pasó / falló / no ejecutado — motivo]
- Contratos/documentación actualizados: [lista o ninguno]
```
