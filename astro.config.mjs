import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://aetherexa.invalid',
  build: { format: 'directory' },
});
