# Delivery Tracking

Small ERP-style delivery tracking app for the Trieon Technosolutions take-home assignment.

Built with Expo (React Native). Mock backend is json-server using the JSON files from the assignment `api` folder.

---

## What it does

- View all deliveries
- Search, sort, and filter by status / driver
- Filters stay applied until you hit Reset
- Pull to refresh
- Create, edit, and delete deliveries with validation
- Reusable list component (search, sort, filters, columns, empty + loading states)

Also added a few nice-to-haves:

- Offline cache + queued create/update/delete (syncs when you’re back online)
- Dark mode toggle (system / light / dark)
- Light animations with Reanimated

---

## Tech used

- Expo Router (SDK 58)
- Zustand for state
- AsyncStorage for filters, cache, and offline queue
- json-server for the mock API
- Reanimated for small UI animations

---

## Folder structure

```
delivery-tracking/
├── api/                 # mock data + db.json for json-server
├── app/
│   ├── (tabs)/          # deliveries list screen
│   └── delivery/        # create / edit screens
├── components/
│   ├── ReusableList/    # generic list with search/sort/filter
│   ├── delivery/        # DeliveryCard + DeliveryForm
│   └── ui/              # shared UI bits
├── constants/           # theme + API config
├── hooks/
├── services/            # API client + storage helper
├── store/               # Zustand stores
├── types/
└── utils/               # validation + list helpers
```

---

## How to run

You need Node.js 18+ and Expo Go (or a simulator).

```bash
cd delivery-tracking
npm install
```

Best way (QR code shows properly) — two terminals:

```bash
# Terminal 1
npm run api

# Terminal 2
npm start
```

Or run both together:

```bash
npm run dev
```

Then:

- scan the QR with Expo Go (same Wi‑Fi as your laptop)
- or press `i` / `a` / `w` for iOS / Android / Web

### If the API doesn’t connect on a real phone

The app usually picks up the same host Expo is using. If not, start with your laptop’s LAN IP:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001 npm start
```

Notes:

- iOS simulator / web → `localhost:3001`
- Android emulator → `10.0.2.2:3001`
- Physical phone → your machine’s LAN IP

---

## API

json-server runs on port `3001` from `api/db.json`.

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/deliveries` | list |
| POST | `/deliveries` | create |
| PUT | `/deliveries/:id` | update |
| DELETE | `/deliveries/:id` | delete |
| GET | `/customers` | customer dropdown |
| GET | `/drivers` | driver dropdown |
| GET | `/statuses` | status dropdown |

Original assignment JSON files are also in `api/` (`deliveries.json`, `customers.json`, etc.).

---

## How the app is put together

Screens stay thin. Most logic sits in the Zustand store (`store/deliveryStore.ts`).

- `ReusableList` doesn’t know about deliveries — the list screen passes columns, filters, and a card renderer
- Form validation lives in `utils/validation.ts`
- API calls go through `services/api.ts`
- If the API is down, the app keeps showing cached data and queues writes. When the network/API is back, pending changes sync and the list refreshes

---

## Tradeoffs I made

- Search / sort / filter are on the client. That’s fine for this mock dataset and keeps the reusable list portable. In a real ERP I’d push filters to the API with pagination.
- Seed data is a bit larger than the original two rows (same schema) so filter/sort demos feel clearer.
- Date is plain `YYYY-MM-DD` text to avoid extra native date-picker setup.

---

## Demo video

I’ll cover:

1. App walkthrough (list, search, filters, CRUD)
2. Folder structure
3. Architecture and why Zustand / reusable list
4. Offline + dark mode briefly
5. Libraries and tradeoffs
