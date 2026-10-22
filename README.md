# DHARA

Smart agriculture app: accounts, weather, soil sensor, market prices, crop advice, and AI chat. The site and API run from one Node server.

## Run locally

```bash
cd backend
npm install
npm start
```

Open http://localhost:5000

`npm run dev` restarts the server when backend files change.

Copy `backend/.env.example` to `backend/.env` and fill in the values. Do not commit `.env`.

## Deploy

From the project root (`DHARA_fixed`):

```bash
npm install
npm start
```

`npm install` also installs the backend. Set these environment variables on the host:

| Variable | Why |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | At least 32 random characters. Required in production. |
| `MONGO_URI` | MongoDB connection string |
| `FRONTEND_URL` | Public site URL, for example `https://your-domain.com` |
| `CORS_ORIGINS` | Same public origin, comma-separated if you have more than one |
| `GOOGLE_CALLBACK_URL` | `https://your-domain.com/api/auth/google/callback` |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail address and app password for OTP |
| `GEMINI_API_KEY` | Google AI Studio key for chat and disease detection |
| `OPENWEATHER_API_KEY` | Weather on the home page and dashboard |
| `DATA_GOV_KEY` | data.gov.in key for market prices |
| `ARDUINO_PORT` | Set to `none` on a cloud host with no sensor |

In Google Cloud Console, add the production callback URL and the site origin.

The host must use HTTPS. The app trusts the platform proxy, so Google sign-in keeps the correct `https` address.

A `Procfile` is included for hosts that use one: `web: node backend/server.js`.

Health check: `GET /api/health`

## Notes

- Sign-up requires the email OTP. The code is stored hashed and expires after 5 minutes.
- AI chat and disease detection require a logged-in account.
- Weather wind speed is shown in km/h.
- Without an Arduino, soil cards stay on “No Sensor Connected”. Set `SENSOR_DEMO=true` only if you want sample NPK numbers.
- Sensor hardware is local. A remote deploy will not see the COM port.
