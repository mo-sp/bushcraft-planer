import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.natureboyz.bushcraftplaner',
  appName: 'Bushcraft Planer',
  webDir: 'dist',
  android: {
    backgroundColor: '#1e281c'
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
