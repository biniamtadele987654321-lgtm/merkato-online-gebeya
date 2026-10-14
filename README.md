# Merkato Online Gebeya

A MERN marketplace foundation for Ethiopia, with 18 market categories and a 22-product demo catalog. The API and React application are separate packages.

## Requirements

- Node.js 20 or later
- MongoDB configured as a replica set (the order and inventory workflows use MongoDB transactions)

## Run locally

1. The frontend can display its 22 bundled demo catalog products immediately if the API is offline. Offline sign-in accepts an unknown email as a browser-local admin preview session; saved demo accounts still require their password. Offline sessions cannot authenticate with the backend, manage real marketplace data, or place real orders.
2. For real API access, configure MongoDB and copy `backend/.env.example` to `backend/.env`. Set `MONGODB_URI`, a unique random `JWT_SECRET` of at least 32 characters, and `CLIENT_ORIGIN` to your frontend origin(s), comma-separated. MongoDB must be running and reachable before the backend starts.
3. Copy `frontend/.env.example` to `frontend/.env` if frontend settings need to be customized.
4. From the project root, run `npm run dev` to start both the backend and frontend. Or run `npm run dev:backend` and `npm run dev:frontend` in separate terminals. Dependencies are installed in each package; run `npm install` inside `backend` and `frontend` only if their dependencies are missing.
5. Open `http://localhost:5173`. Once connected, the API health check is at `http://localhost:5000/api/health`. If the API is configured for `localhost:5000` but the frontend is opened at `127.0.0.1:5173`, make sure both frontend origins are in `CLIENT_ORIGIN` (the example includes both); restart the API after changing `.env`.

On Windows PowerShell, start the backend and frontend in two separate terminals:

```powershell
Set-Location "D:\Ashu web\Ashu project\backend"
npm install
npm run dev
```

```powershell
Set-Location "D:\Ashu web\Ashu project\frontend"
npm install
npm run dev
```

### MongoDB connection options

- **Local MongoDB on Windows:** Install MongoDB Community Server and MongoDB Shell (`mongosh`). In PowerShell, create a data folder with `New-Item -ItemType Directory -Force C:\data\db`, then start `mongod --dbpath C:\data\db --replSet rs0` in its own terminal and leave it running. In another terminal, run `mongosh` and then `rs.initiate()` once; wait for the node to become primary. The example URI in `backend/.env.example` connects to this local replica set.
- **MongoDB Atlas:** Create a database user and allow your development machine's IP address in Atlas Network Access. Copy the driver's `mongodb+srv://` connection string into `MONGODB_URI`, replace the username/password and cluster host, and URL-encode special characters in the password. The database name can be `ethiopian_marketplace`. Atlas clusters are replica sets and support the transactions used during checkout.
- **MongoDB Compass:** Compass is a desktop client, not a database server. Use it to connect to the same local or Atlas URI, inspect the database, and confirm the seed collections were created. It does not replace starting a local `mongod` service or configuring Atlas.
- After changing `.env`, restart the backend. The API will log a MongoDB connection error and will not start if the URI is missing or invalid.

### Load demo products and users

With MongoDB running and the backend `.env` configured, run `npm run seed` from `backend`. This creates two verified demo stores, 22 products and three demo accounts. Re-running the command safely updates the sample stores/products without changing passwords on existing demo accounts. It refuses to run with `NODE_ENV=production`.

To seed them automatically whenever the development API starts, set `SEED_DEMO_DATA=true` in `backend/.env` and restart it. Leave it `false` (or unset) when you don't want startup writes. If MongoDB is not configured yet, the storefront still has its bundled catalog-only demo fallback.

| Role | Email | Password |
| --- | --- | --- |
| Vendor | `hana.vendor@merkato.test` | `HanaDemo2026!` |
| Vendor | `dawit.vendor@merkato.test` | `DawitDemo2026!` |
| Customer | `mimi.customer@merkato.test` | `MimiDemo2026!` |

These are development-only credentials. Never deploy seeded demo accounts or passwords to production.

### Provision the first administrator

Admin self-registration is intentionally disabled. First configure MongoDB and `JWT_SECRET` in `backend/.env` (copy `backend/.env.example` if needed). Set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, and a new `ADMIN_PASSWORD` with at least 12 characters in that ignored local environment file. From the project root, run `npm run admin:create` (or run the command from `backend`). The password is hashed through the same model hook used for user registration.

If the email already belongs to a customer or vendor account, provisioning refuses to elevate it by default. To intentionally promote that existing account and reset its password to the configured `ADMIN_PASSWORD`, set `ADMIN_PROMOTE_EXISTING=true` in `backend/.env` before running the command, then change it back to `false`. Never put real account values in tracked files or screenshots.

If you previously exposed a real password in a screenshot, change it before using the account for anything beyond local testing.

## Implemented API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products` (search, category, price range, vendor and pagination), `GET /api/products/:id`; vendor-only `POST`, `PATCH /:id` and `DELETE /:id`
- Vendor-only `GET|PUT /api/vendors/me/store`, `GET /api/vendors/me/dashboard`, `GET /api/vendors/me/products`, `GET /api/vendors/me/orders`, `PATCH /api/vendors/me/orders/:id/status`
- Customer-only `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel`, `POST /api/orders/:id/payment`
- Admin-only `GET /api/admin/dashboard`, paginated `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `DELETE /api/admin/users/:id`, `GET /api/admin/stores`, `PATCH /api/admin/stores/:id/verification`, paginated `GET /api/admin/products`, `PATCH /api/admin/products/:id/visibility`, `DELETE /api/admin/products/:id`, and paginated `GET /api/admin/orders`

Send authenticated requests with `Authorization: Bearer <token>`. Payment methods support Cash on Delivery order creation. Chapa and Telebirr checkout deliberately return `501` until server-side gateway adapters, secret management, and verified callbacks are implemented; no order is marked paid by an unverified request.

## Frontend

The responsive React app includes marketplace discovery, 18 Ethiopian-market categories, search/filtering, product details, a local cart, address and payment-method checkout, account registration/sign-in, order history, vendor store/product/order management, and a role-protected admin dashboard with analytics, vendor verification, user and product moderation, and paginated order oversight. The language selector provides English, Amharic, Afaan Oromoo, Tigrigna, and Arabic. Customer and vendor pages are protected by role; non-admin users are redirected to an access-denied page when they try to open the admin panel. Admin accounts must be provisioned out of band.

Admin account deletion is blocked for accounts with customer order history or vendor products referenced by orders, preserving transaction records. Product moderation hides listings with order history from the public catalog without deleting the historical product record; unreferenced products may be deleted.
