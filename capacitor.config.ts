import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.pharmatwin.app',
    appName: 'PharmaTwin',
    webDir: 'www',
    server: {
        url: "https://pharmatwin-1.onrender.com",
        cleartext: false
    }
};

export default config;