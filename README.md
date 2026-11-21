# LifeLink

LifeLink is a mobile app prototype for emergency and community safety in Ghana. Its goal is to help people reach useful safety information and community support more quickly.

> **Prototype notice:** LifeLink is not an emergency dispatch service. Do not rely on it to contact emergency responders. For urgent help, call the appropriate local emergency service directly.

## What’s in the prototype

The Expo app includes screens and sample flows for:

- Account registration, login, and profile management.
- SOS and live-location screens.
- Emergency hotlines and personal emergency contacts.
- Hospital and pharmacy finders.
- Blood donor search.
- Community incident reports, missing-person reports, and sightings.
- Disaster alerts, volunteer, and community screens.

The SOS flow requests foreground location access, records the coordinates on the backend, and opens an SMS composer addressed to saved trusted contacts. The user must review and tap Send; LifeLink cannot verify message delivery. Contacts are stored on the device. The SOS map view and message link point to the captured coordinates. There is no automatic SMS, push alert, background tracking, or live ambulance, police, or fire-service dispatch integration.

## Technology

- **Mobile:** React Native, Expo SDK 57, JavaScript
- **Backend:** Node.js, Express
- **Authentication:** JWT and bcrypt
- **Validation:** Zod
- **Local app storage:** AsyncStorage

The current backend is a prototype: user and SOS records are written to local JSON files, while incident and missing-person records are held in memory and are lost when the server restarts. It does not currently use PostgreSQL or Prisma. SOS recording requires a signed-in user and a reachable backend; when recording fails, the app reports the failure and still lets the user prepare an SMS.

## Getting started

### Requirements

- Node.js and npm
- A device or simulator for running the Expo app

### Run the mobile app

From the project root:

```powershell
npm install
$env:EXPO_PUBLIC_API_URL = "http://localhost:4000/api"
npm start
```

Use the Expo CLI prompts to open the app on web, Android, or iOS. The API URL above assumes the app can reach the backend at `localhost`; when using a physical device, replace `localhost` with the computer’s reachable LAN address.

### Run the backend

In a second terminal:

```powershell
cd backend
npm install
New-Item -ItemType Directory -Force data | Out-Null
npm run dev
```

The backend listens on port `4000` by default. The mobile app’s API URL defaults to port `4002`, so set `EXPO_PUBLIC_API_URL` as shown above (or configure it to match your backend). You can override the backend port with `PORT`.

The SOS SMS composer is available on Android and iOS devices with SMS capability; it is not available in a browser or iOS simulator. Test with trusted contacts and never assume an alert was delivered.

For local development, set a private `JWT_SECRET` environment variable rather than relying on the backend’s built-in development fallback. Do not use the prototype backend as-is for production or real emergency data.

## Project layout

```text
.
├── App.js                 # App startup and screen navigation
├── screens/               # Mobile app screens
├── utils/                 # Authentication, notification, and validation helpers
├── assets/                # App icons and splash assets
└── backend/
    └── server.js          # Express API
```

## Roadmap

The broader LifeLink vision includes trusted-contact SOS notifications, verified emergency and disaster alerts, reliable nearby healthcare information, blood donor coordination, and collaboration with emergency services. These capabilities require production-grade infrastructure and, for official dispatch or alerts, partnerships with the relevant organizations.
