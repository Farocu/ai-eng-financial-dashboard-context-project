import { useEffect, useState, lazy, Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((m) => ({
    default: m.IncomeOutcomeChart,
  }))
);

const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((m) => ({
    default: m.ProfitPercentChart,
  }))
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

// Hoisted static fallback to avoid recreating JSX on every render
const chartFallback = (
  <div
    className="h-[280px] rounded-lg bg-muted animate-pulse"
    aria-busy={true}
    role="status"
    aria-label="Loading chart"
  />
);

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchFinancialData()
      .then((movements) => {
        if (cancelled) return;
        // Compute KPIs and monthly data in parallel since they share the same input
        const [kpis, monthly] = [computeKPIs(movements), computeMonthlyData(movements)];
        setMetrics(kpis);
        setMonthlyData(monthly);
      })
      .catch(() => {
        if (cancelled) return;
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-ring"
      >
        Skip to main content
      </a>
      <div
        id="main-content"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {error !== null ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={chartFallback}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
            </Suspense>
            <Suspense fallback={chartFallback}>
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
