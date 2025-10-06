import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pomodoro.timer",
  appName: "Pomodoro Timer",
  webDir: "dist",
  server: {
    androidScheme: "https",
    url: "http://localhost:5173",
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
