# LocalHaat – Local Marketplace Platform (MERN)

A marketplace where local sellers list products and customers browse, cart and order items available in their locality. Built with MongoDB, Express, React and Node.

## Features
- Role-based auth (customer, seller, admin) with JWT and bcrypt-hashed passwords
- Sellers: add, edit, delete products; quick price/stock edit; availability toggle; view and update orders for their products
- Customers: search (name, category, shop, location), filter (category, location, price, availability), sort, cart with stock limits, checkout, order tracking, cancel pending orders
- Admin: marketplace stats, enable/disable/delete users, remove products
- Atomic stock reservation on checkout (no overselling); stock is restored when an order is cancelled
- Loading, empty and error states, toasts, confirmation dialogs, responsive layout

## Technologies
React 18 (Vite), React Router 6, Axios, Context API · Node.js, Express 4, Mongoose 8, jsonwebtoken, bcryptjs, dotenv, cors · MongoDB

## User roles
| Role | Access |
|---|---|
| customer | Browse, cart, orders, profile |
| seller | Own products, orders containing own products, seller profile |
| admin | All users/products, stats (created by seed only; cannot self-register) |

Customers cannot call seller APIs and sellers cannot call admin APIs (`roleMiddleware` returns 403 "You do not have permission").

## Authentication
`POST /api/auth/login` returns a JWT (7 days). The client stores it in `localStorage` and sends `Authorization: Bearer <token>`. `authMiddleware` verifies the token and loads the user; a 401 from the API logs the user out automatically. (For stricter production security, move the token to an httpOnly cookie.)

## Database design
- **User**: name, email (unique), phone, password (hashed, `select:false`), role, location, shopName, shopAddress, isActive, createdAt
- **Product**: name, description, category, price (≥0), quantity (integer ≥0), location, image, seller → User, isAvailable, timestamps
- **Order**: customer → User, items[{product, seller, name, image, price, quantity}] (price snapshot), totalAmount, deliveryLocation, status (Pending/Confirmed/Preparing/Delivered/Cancelled), createdAt

## API endpoints
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET / PUT | /api/auth/me | any logged-in user |
| GET | /api/products (`q, category, location, minPrice, maxPrice, availability=all, sort=newest\|price_asc\|price_desc, page, limit`) | public |
| GET | /api/products/:id | public |
| POST / PUT / DELETE | /api/products, /api/products/:id | seller (owner only) |
| GET | /api/seller/products, /api/seller/orders, /api/seller/stats | seller |
| POST | /api/orders | customer |
| GET | /api/orders | customer (own), seller (relevant), admin (all) |
| GET | /api/orders/:id | owner customer, involved seller, admin |
| PUT | /api/orders/:id/status | seller/admin any status; customer may cancel own Pending order |
| GET | /api/admin/stats, /users, /products | admin |
| PUT | /api/admin/users/:id/status | admin |
| DELETE | /api/admin/users/:id, /api/admin/products/:id | admin |

Note: an order may contain items from several sellers; sellers only see their own line items, but the order status is shared by the whole order.

## Project structure
```
local-marketplace/
├── client/   (Vite + React: components, pages, context, services, hooks)
├── server/   (controllers, models, routes, middleware, config, utils, server.js, seed.js)
├── .env.example
├── README.md
└── package.json
```

## Installation
Requirements: Node.js 18+, a MongoDB instance (local or Atlas).

```bash
cd local-marketplace
npm install            # installs root tools (concurrently)
npm install --prefix server
npm install --prefix client
# or in one go: npm run install-all
cp .env.example .env   # then edit the values
```

## Environment variables (`.env` in the project root)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SEED_PASSWORD=choose_a_demo_password   # only for the seed script
```

## How to run
```bash
npm run seed   # optional demo data (wipes users, products, orders)
npm run dev    # starts API on :5000 and React on :5173
```
Or separately: `cd server && npm run dev` and `cd client && npm run dev`. Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.

Production: `npm run build --prefix client`, serve `client/dist` with any static host and set `VITE_API_URL` and `CLIENT_URL` accordingly.

## Demo accounts (after `npm run seed`)
Password for all accounts is the `SEED_PASSWORD` you set in `.env`.

| Role | Email |
|---|---|
| Admin | admin@localmarket.com |
| Seller | ravi@localmarket.com, anita@localmarket.com |
| Customer | priya@localmarket.com, arjun@localmarket.com, sneha@localmarket.com |

## Testing checklist
1. Register a customer and a seller (duplicate email → "Email already registered")
2. Log in as each; check redirects (customer → /dashboard, seller → /seller, admin → /admin)
3. As seller: add, edit, change price/stock inline, toggle availability, delete (with confirmation)
4. As a second seller: try `PUT/DELETE /api/products/<other seller's id>` → 403
5. As customer: call `POST /api/products` → 403; call without a token → 401
6. Browse, search, filter, sort; add to cart; try exceeding stock → blocked
7. Checkout; confirm stock decreases; view order and tracker
8. As seller: see the order with only your items; change status; customer sees the new status
9. Cancel a Pending order as customer; stock is restored
10. As admin: view stats, disable a user (they can no longer log in), remove a product
