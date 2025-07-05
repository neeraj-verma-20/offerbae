import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.offerbae.app',
  appName: 'OfferBae',
  webDir: 'dist',
  server: {
    url: 'https://in.offerbae.in',
    cleartext: true
  }
};

export default config;
