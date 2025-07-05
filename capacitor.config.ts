import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.offerbae.app',
  appName: 'OfferBae',
  webDir: 'dist', // ✅ not needed when using server.url, but okay to keep
  server: {
    url: 'https://in.offerbae.in',
    cleartext: true
  }
};

export default config;
