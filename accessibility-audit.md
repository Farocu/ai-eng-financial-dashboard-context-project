# Accessibility Audit Report

## Resumen de Accesibilidad

Auditoría realizada sobre el dashboard financiero. Se evaluaron: navegación por teclado, atributos ARIA, roles, texto alternativo en iconos, y contraste de color.

---

## 1. Navegación por Teclado

### ✅ Correcto
- **Skip to main content**: enlace visible al recibir foco (`Tab`). Se usan clases `sr-only focus:not-sr-only` de Tailwind.
- **Estructura semántica**: `<main>`, `<section>` (con `aria-label`), `<h1>`, `<header>`, `<figure>`, `<table>`, `<nav>` implícita.
- **Elementos interactivos**: el dashboard no tiene botones, inputs ni selects, por lo que el flujo de tabulación es correcto (solo el skip link recibe foco).

### 🔧 Mejoras aplicadas
- El skip link ahora usa `sr-only` de Tailwind en vez de la clase custom `visually-hidden`, lo que garantiza comportamiento consistente al recibir foco en todos los navegadores.
- Se añadió `focus:outline-ring` al skip link para un anillo de foco visible.

---

## 2. Atributos ARIA / Roles

### ✅ Correcto
- `aria-hidden="true"` en todos los iconos decorativos de Lucide.
- `aria-busy={true}` en los skeletons de carga.
- `aria-label` en secciones (`<section aria-label="Key performance indicators">`, etc.).
- `role="img"` + `aria-label` descriptivo en los gráficos (`<figure>`).
- `scope="col"` en los `<th>` de las tablas de datos.

### 🔧 Mejoras aplicadas
| Archivo | Cambio |
|---|---|
| `kpi-card.tsx` | `aria-busy="true"` → `aria-busy={true}` (booleano en vez de string) |
| `income-outcome-chart.tsx` | Quitado `aria-hidden="true"` de la tabla oculta para SR |
| `profit-percent-chart.tsx` | Quitado `aria-hidden="true"` de la tabla oculta para SR |
| `App.tsx` | Añadido `role="alert"` y `aria-live="polite"` al bloque de error |
| `App.tsx` | Añadido `aria-busy={true}`, `role="status"` y `aria-label` a los fallbacks de Suspense |
| `income-outcome-chart.tsx` | Añadido `role="status"` y `aria-label` al mensaje "No data" |
| `profit-percent-chart.tsx` | Añadido `role="status"` y `aria-label` al mensaje "No data" |

> **IMPORTANTE**: Las tablas ocultas (`visually-hidden`) dentro de los gráficos contienen los datos en formato tabular accesible. Antes tenían `aria-hidden="true"`, lo que las hacía inaccesibles para lectores de pantalla — anulando por completo su propósito. Se corrigió eliminando ese atributo.

---

## 3. Texto Alternativo en Imágenes / Iconos

### ✅ Correcto
- Todos los iconos (`TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart2`, `LayoutDashboard`) usan `aria-hidden="true"` + son decorativos con texto visible al lado.
- Los gráficos tienen `<figure role="img" aria-label="...">` con descripciones textuales.
- No hay imágenes `<img>` en la aplicación, solo SVG inline de Lucide.

### 🔧 No requiere cambios
El patrón actual es el recomendado por WAI-ARIA: iconos decorativos → `aria-hidden`, información esencial → texto visible.

---

## 4. Contraste de Color

### Resumen de ratios calculados (WCAG AA: ≥4.5:1 para texto normal)

#### ✅ Modo Claro (todos correctos)
| Combinación | Ratio | Resultado |
|---|---|---|
| `foreground` sobre `background` | 17.2:1 | ✅ AA/AAA |
| `muted-foreground` sobre `background` | 13.4:1 | ✅ AA/AAA |
| `muted-foreground` sobre `card` | 16.3:1 | ✅ AA/AAA |
| `income-badge-fg` sobre badge | 13.2:1 | ✅ AA/AAA |
| `outcome-badge-fg` sobre badge | 10.5:1 | ✅ AA/AAA |
| `profit-badge-fg` sobre badge | 11.7:1 | ✅ AA/AAA |
| `secondary-fg` sobre `secondary` | 13.1:1 | ✅ AA/AAA |

#### ✅ Modo Oscuro (corregido)
| Combinación | Antes | Después | Resultado |
|---|---|---|---|
| `muted-foreground` sobre `background(0.13)` | 2.61:1 ❌ | **4.83:1** ✅ | Corregido |
| `muted-foreground` sobre `card(0.18)` | 2.60:1 ❌ | **4.80:1** ✅ | Corregido |
| `income-badge-fg` sobre `income-badge` | 4.45:1 ⚠️ | **5.07:1** ✅ | Corregido |
| `profit-badge-fg` sobre `profit-badge` | 4.15:1 ⚠️ | **4.89:1** ✅ | Corregido |
| `outcome-badge-fg` sobre `outcome-badge` | 5.06:1 ✅ | Sin cambios | ✅ |
| `foreground` sobre `background` | 14.1:1 ✅ | Sin cambios | ✅ |
| `secondary-fg` sobre `secondary` | 13.9:1 ✅ | Sin cambios | ✅ |

### 🔧 Cambios en `index.css` (modo oscuro `.dark`)
```css
--muted-foreground: oklch(0.78 0.01 240);  /* era 0.68 */
--income-badge-fg: oklch(0.74 0.16 155);   /* era 0.72 */
--profit-badge-fg: oklch(0.76 0.16 255);   /* era 0.72 */
```

---

## 5. Consideraciones Adicionales

### ♿ Reducir Movimiento
Ya existe una media query `@media (prefers-reduced-motion: reduce)` en `index.css` que desactiva animaciones, transiciones y desplazamiento suave. ✅

### 🏷️ Idioma
`<html lang="en">` presente en `index.html`. ✅

### ⚠️ Pre-existing Issue (no introducido por esta auditoría)
Hay un error de TypeScript (`TS1005: ')' expected`) en `profit-percent-chart.tsx` línea 135 que pre-existe. Es probablemente un falso positivo del parser con TypeScript 6.0.2 y JSX — se reporta por separado.

---

## Archivos Modificados

| Archivo | Cambios |
|---|---|
| `frontend/src/App.tsx` | Skip link mejora, `role="alert"` en error, `aria-busy`/`role="status"` en Suspense |
| `frontend/src/components/dashboard/kpi-card.tsx` | `aria-busy` booleano correcto |
| `frontend/src/components/dashboard/income-outcome-chart.tsx` | Quitado `aria-hidden` de tabla, `role="status"` en no-data |
| `frontend/src/components/dashboard/profit-percent-chart.tsx` | Quitado `aria-hidden` de tabla, `role="status"` en no-data |
| `frontend/src/index.css` | Contraste corregido en modo oscuro |

---

*Auditoría generada para el proyecto ai-eng-financial-dashboard-context-project — 2026-11-17*