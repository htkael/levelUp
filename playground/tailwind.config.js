import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        prospector: 'var(--color-prospector)',
        areaManager: 'var(--color-area-manager)',
        marketManager: 'var(--color-market-manager)',
        salesAgent: 'var(--color-sales-agent)',
        transactionCoordinator: 'var(--color-transaction-coordinator)',
        fundManager: 'var(--color-fund-manager)',
        propertyManager: 'var(--color-property-manager)',
        admin: 'var(--color-admin)',

        neutralFocus: 'var(--color-neutral-focus)',
        secondaryFocus: 'var(--color-secondary-focus)',
      }
    }
  },
  plugins: [
    typography(),
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        reap: {
          "primary": "#0369a1",
          "secondary": "#94a3b8",
          //"secondary-focus": "#94a3b8",
          "accent": "#a1edb0", //TODO
          "neutral": "#475569",
          "neutral-content": "#f9fafb",
          "neutral-focus": "#64748b",
          "base-content": "#f9fafb",
          "base-100": "#374151",
          "base-200": "1f2937",
          "base-300": "#111827",
          "success": "#22c55e",
          "warning": "#facc15",
          "error": "#ef4444",
          "reamp": "#a1edb0",
        }
      }
    ]
  }
}
