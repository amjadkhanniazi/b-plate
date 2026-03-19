# S-Plate — Express.js Boilerplate

Production-ready Express.js backend boilerplate with JWT auth, optional RBAC, security middleware, Winston logging, and Docker support — optimized for deployment on a self-hosted VPS.

---

## Stack

- **Runtime**: Node.js 20 + Express.js 5
- **Database**: MongoDB via Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting, XSS, NoSQL injection, HPP
- **Logging**: Winston (console + file)
- **Container**: Docker (multi-stage build, non-root user)

---

## Folder Structure

```
src/
├── config/
│   ├── db.js               MongoDB connection
│   └── env.js              Joi env validation (crashes early if config missing)
├── controllers/
│   └── auth.controller.js  Thin handlers — delegate to services
├── middleware/
│   ├── auth.js             protect + authorize (RBAC opt-in)
│   ├── errorHandler.js     Global error handler
│   ├── notFound.js         404 handler
│   └── validate.js         Joi body validation middleware
├── models/
│   └── User.js             User schema with role field
├── routes/
│   └── v1/
│       ├── auth.routes.js  Auth endpoints
│       └── index.js        Mount all v1 routes here
├── services/
│   └── auth.service.js     Business logic
├── utils/
│   ├── AppError.js         Custom operational error class
│   ├── jwt.js              Token generation + verification
│   ├── logger.js           Winston logger
│   └── response.js         sendSuccess / sendError helpers
├── validations/
│   └── auth.validation.js  Joi schemas for auth
├── app.js                  Express app setup
└── server.js               Entry point + graceful shutdown
```

---

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Start dev server
npm run dev
```

---

## API Endpoints

| Method | URL | Auth Required |
|--------|-----|---------------|
| POST | `/api/v1/auth/register` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/refresh` | No |
| POST | `/api/v1/auth/logout` | Yes (Bearer token) |
| GET | `/api/v1/auth/me` | Yes (Bearer token) |
| GET | `/api/health` | No |

### Response Shape

All responses follow a consistent structure:

```json
// Success
{ "success": true, "message": "...", "data": {...} }

// Error
{ "success": false, "message": "...", "errors": [...] }
```

---

## Authentication Flow

```
Register / Login  →  returns { accessToken, refreshToken, user }
                              ↓
All protected requests  →  Authorization: Bearer <accessToken>
                              ↓
Access token expires  →  POST /api/v1/auth/refresh  { refreshToken }
                              ↓
Returns new token pair
```

---

## Role-Based Access Control (RBAC)

RBAC is built in but **opt-in per route**. If your project doesn't need it, simply don't use `authorize()`.

```js
const { protect, authorize } = require("../../middleware/auth");

// Standard auth — no role check
router.get("/profile", protect, getProfile);

// Admin only
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Multiple roles allowed
router.patch("/posts/:id", protect, authorize("admin", "editor"), updatePost);
```

To add a new role, update the `enum` in `src/models/User.js`:
```js
role: {
  type: String,
  enum: ["user", "admin", "editor"],  // add here
  default: "user",
}
```

---

## Adding a New Feature

Example: adding a `posts` resource.

1. **Model**: `src/models/Post.js`
2. **Validation**: `src/validations/post.validation.js`
3. **Service**: `src/services/post.service.js`
4. **Controller**: `src/controllers/post.controller.js`
5. **Routes**: `src/routes/v1/post.routes.js`
6. **Register**: in `src/routes/v1/index.js`:
   ```js
   const postRoutes = require("./post.routes");
   router.use("/posts", postRoutes);
   ```

---

## VPS Deployment

### Option A — Using shared-mongodb (recommended for simple projects)

```bash
# 1. Upload to VPS (from Windows PowerShell — remove node_modules first)
Remove-Item -Recurse -Force .\node_modules
scp -r . root@176.100.37.12:/opt/myproject

# 2. SSH into VPS
ssh root@176.100.37.12

# 3. Set env vars in docker-compose.yml under environment:
#    MONGO_URI: mongodb://user:pass@172.17.0.1:27018/myproject
#    JWT_SECRET: <your secret>
#    JWT_REFRESH_SECRET: <your secret>

# 4. Deploy
cd /opt/myproject
docker compose up -d --build

# 5. Add to Nginx Proxy Manager
#    Domain: api.myproject.domael.site
#    Forward Hostname: 172.17.0.1
#    Forward Port: 5002
#    SSL: Request new cert → Force SSL → HTTP/2
```

### Option B — Private MongoDB in compose

Uncomment the `mongodb` service in `docker-compose.yml` and update `MONGO_URI` to use the service name.

### Port Convention

Backend APIs use ports starting from `5002` (5000 and 5001 are already in use on the VPS).
Update `PORT` in `.env` / `docker-compose.yml` and `EXPOSE` in `Dockerfile` to match.

---

## Useful Commands

```bash
# View logs
docker logs s-plate-backend -f

# Restart
docker compose restart backend

# Rebuild after code changes
docker compose up -d --build

# Shell into container
docker exec -it s-plate-backend sh

# Check health
curl http://localhost:5002/api/health
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | App environment |
| `PORT` | No | `5000` | Server port |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Access token secret (32+ chars) |
| `JWT_EXPIRE` | No | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token secret (32+ chars) |
| `JWT_REFRESH_EXPIRE` | No | `30d` | Refresh token expiry |
| `CORS_ORIGIN` | No | `*` | Comma-separated allowed origins |
