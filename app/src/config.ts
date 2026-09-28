// Runs before the rest of the app loads (imported first in main.tsx), so every module sees the
// right paths. VITE_API_BASE points a static copy of the site (GitHub Pages) at the API on Netlify.
import { configureAssets } from '../shared/data.ts';

configureAssets({ base: import.meta.env.BASE_URL, api: import.meta.env.VITE_API_BASE ?? '' });
