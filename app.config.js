import 'dotenv/config';

export default {
  expo: {
    name: "TravelRouteApp",
    slug: "TravelRouteApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/favicon.png",
    splash: {
      image: "./assets/roadtrip_splash.jpg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/road-pngrepo-com.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.bakalauras.travelrouteapp",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
}
