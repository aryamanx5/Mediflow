# MediFlow — frontend

React 19 + TypeScript + Vite + Tailwind v4. This is the **frontend only**. The
Express/MongoDB service in `../mediversal-backend` is a separate, unmodified
application and remains the source of truth for all data.

## Running

The backend must be running first (from `../mediversal-backend`):

```bash
npm start
```

Then, in this directory:

```bash
npm run dev
```

Vite serves on **5173** and proxies `/api` to `http://127.0.0.1:3000`. If the
backend is on another port, point the proxy at it:

```bash
VITE_API_TARGET=http://127.0.0.1:3100 npm run dev
```

For a production build, set `VITE_API_URL` to the deployed API's base URL
(including `/api`). With it unset the app calls `/api` on its own origin.

## Structure

```
src/
├── components/          shared UI
│   ├── ui/              Button, Field, Modal, Drawer, Table, Badge, Pagination…
│   ├── forms/           Product, Customer and Order forms
│   └── landing/         hero, doctor rig, 3D scene, story, features
├── pages/               Landing, SignIn, Register, Overview, Products, Customers, Orders
├── layouts/             AuthLayout, AppLayout
├── hooks/               useAuth, useResource, usePointer, useReveal, useToast…
├── services/            api.ts (endpoints), client.ts (fetch/auth), types.ts
├── lib/                 formatting, stock derivation
└── assets/doctor/       the hero photograph and its rig config
```

`services/` is the only place that talks to the backend. No component calls
`fetch` directly, and `types.ts` mirrors the Mongoose schemas exactly.

## The doctor

`src/assets/doctor/` holds the hero photograph. Drop a file named `doctor.png`
/ `.webp` / `.avif` / `.jpg` in there and it is picked up automatically — see
that folder's README and `config.ts`, which also carries the head-box and
cursor-response tuning. Without a photo the hero falls back to a neutral
placeholder silhouette with the same rig.

## Notes on the backend contract

The frontend adapts to the existing API; none of these are worked around by
changing the server:

- **`/api/products`, `/api/customers` and `/api/orders` are unauthenticated.**
  Only `/api/users/*` uses the `protect` middleware. Routes are still gated
  client-side and every request sends `Authorization`, but the API itself does
  not enforce it.
- **Login returns a token only**, so the signed-in user's name and role come
  from a follow-up `GET /api/users/profile`.
- **Register returns no token**, so a new account is sent to sign in.
- **There is no analytics endpoint.** Overview totals come from each list
  endpoint's `total`, and the low-stock signal is derived client-side from
  `stockQuantity` vs `minimumStock`. Nothing on that screen is estimated.
- **Orders have no status-update route**, only `PUT /api/orders/cancel/:id`.
  Status is therefore read-only plus Cancel.
- **Order search by phone never matches**: the controller filters on
  `customer.phoneNumber`, but the Customer schema's field is `phone` and the
  populate only selects `customerName phoneNumber customerId`. Only order
  number and customer name are offered in the UI.
