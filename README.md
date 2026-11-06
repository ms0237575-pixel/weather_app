# Weatherly

Weatherly is a location-aware weather dashboard for keeping an eye on current conditions in the places that matter to you. Its carefully considered interface pairs an obsidian and ivory palette with restrained wine-red accents, editorial typography, and softly layered surfaces for a distinctive, minimalist feel.

## Preview

> **Preview image coming soon.** Add a screenshot of the dashboard at `docs/preview.png` and replace this note with:
> `![Weatherly dashboard preview](./docs/preview.png)`

## Features

- **Current local weather** — See temperature, feels-like temperature, humidity, wind speed, weather conditions, and local observation time.
- **Interactive 7-day forecast** — Switch forecast locations, explore daily conditions and precipitation chances, and compare the high/low temperature trend.
- **Country selection** — Browse and select from supported countries.
- **Location search** — Find cities within the selected country; results are debounced and can be retried if a request fails.
- **Useful starting places** — Automatically loads major populated places for the selected country so the dashboard is ready to explore.
- **Manageable dashboard** — Add a searched location to the top of the list, avoid duplicates, and display up to 12 places at a time.
- **Responsive, considered UI** — Layouts adapt across phones, tablets, and desktop screens, with keyboard-accessible controls and reduced-motion support.
- **Weather-specific visuals** — Weather conditions are paired with matching icons and helpful loading and error states.
- **Efficient rendering** — Zustand selectors keep state subscriptions focused, while memoized weather cards reduce avoidable updates.
- **No API key required for local development** — Weather and geocoding data are requested from the public services listed below.

## Tech Stack

| Area | Technologies |
| --- | --- |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS custom properties, `tw-animate-css` |
| Build and development | Vite 8 |
| State management | Zustand |
| Search controls | `cmdk`, Base UI |
| Validation | Zod |
| Icons and typography | Hugeicons, Inter Variable |
| Linting | ESLint, TypeScript ESLint |

## Data Sources

- **Weather forecasts and place search:** [Open-Meteo](https://open-meteo.com/)
- **Major populated places:** GeoNames data served by [OpenDataSoft](https://www.opendatasoft.com/)

Weather and location datasets are credited under **CC BY 4.0**. See the in-app footer for attribution.

## Requirements

- Node.js compatible with the installed Vite version
- pnpm (available directly or through Corepack)

## Local Setup

1. **Open a terminal in the project directory:**

   ```sh
   cd path/to/weather-app
   ```

   If you are using PowerShell with this checkout:

   ```powershell
   Set-Location C:\Users\LTC\Downloads\weather-app\weather-app
   ```

2. **Enable pnpm with Corepack, if needed:**

   ```sh
   corepack enable
   ```

3. **Install dependencies:**

   ```sh
   pnpm install
   ```

4. **Start the development server:**

   ```sh
   pnpm dev
   ```

5. **Open the local address** printed in the terminal (Vite defaults to `http://localhost:5173`).

## Project Commands

Run these from the project root:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server with hot module replacement. |
| `pnpm build` | Type-check the project and create a production build in `dist/`. |
| `pnpm preview` | Serve the production build locally for a final check. Run `pnpm build` first. |
| `pnpm lint` | Run ESLint across the project. |

## Project Structure

```text
src/
├── components/       # Application UI and reusable interface components
│   └── ui/           # Shared primitive components
├── config/           # Curated location configuration
├── hooks/            # Location-search hook and request lifecycle
├── lib/              # Country, place, weather-code, and error helpers
├── services/         # Open-Meteo and place-discovery API clients
├── store/            # Zustand weather and location state
└── types/            # Shared TypeScript types
```

## Notes

- No application-specific API key or environment file is required for the current public data services.
- The app requests live data from external services, so weather and location loading depend on network availability and those services being reachable.
- The repository provides build and lint scripts; it does not currently define a dedicated automated test script.
