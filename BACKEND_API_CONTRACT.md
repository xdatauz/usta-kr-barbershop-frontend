# Usta Barbershop — Frontend → Backend API Contract

This document is generated from the current frontend codebase and lists **all API endpoints the frontend expects**.

## Base URL / Prefix

- **Base URL env**: `VITE_API_BASE_URL`
- **API prefix**: `${VITE_API_BASE_URL}/api/v1`
- **Example**: if `VITE_API_BASE_URL=https://api.usta.uz` then prefix is `https://api.usta.uz/api/v1`

## Conventions

### Auth

- **Bearer access token** is sent as header:
  - `Authorization: Bearer <accessToken>`
- Frontend stores tokens in localStorage:
  - access: `usta_access_token` (fallback key: `access_token`)
  - refresh: `usta_refresh_token`
- All requests are sent with `credentials: "include"` (cookies allowed), so backend should set CORS accordingly if cross-origin.

### Standard success payload

Frontend supports **either** of these shapes:

1) raw payload is the data
2) wrapper payload with a `data` property

Example (either is OK):

```json
{ "data": { "id": "123" } }
```

or:

```json
{ "id": "123" }
```

### Standard error payload

Frontend expects an error payload like:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "fields": { "email": "Invalid email" }
  }
}
```

Backend may also return `{ "message": "..." }` and it will be shown to the user.

## Endpoints

### 1) Auth

#### POST `/auth/login`

- **Body**

```json
{ "email": "user@example.com", "password": "secret" }
```

- **200 Response** (one of these shapes)

```json
{
  "accessToken": "jwt-or-token",
  "refreshToken": "refresh-token",
  "user": { "id": "u1", "name": "User", "email": "user@example.com", "userType": "USER", "image": null }
}
```

or:

```json
{
  "token": "jwt-or-token",
  "refreshToken": "refresh-token",
  "id": "u1",
  "name": "User",
  "email": "user@example.com",
  "userType": "USER",
  "image": null
}
```

Notes:
- Frontend accepts `accessToken` **or** `token` as the access token field.

#### POST `/auth/signup`

- **Body**

```json
{ "name": "User", "email": "user@example.com", "password": "secret", "userType": "USER" }
```

- **200 Response**: same shape as login.

Notes:
- `userType` values used by frontend: `"USER" | "ADMIN" | "BARBER"`.

#### GET `/auth/me` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **200 Response**

```json
{ "id": "u1", "name": "User", "email": "user@example.com", "userType": "USER", "image": null }
```

or:

```json
{ "user": { "id": "u1", "name": "User", "email": "user@example.com", "userType": "USER", "image": null } }
```

#### POST `/auth/logout` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **200 Response**: empty body or `{ "ok": true }`

#### POST `/auth/refresh`

Used automatically when any auth request returns `401`.

- **Body**

```json
{ "refreshToken": "refresh-token" }
```

- **200 Response**

```json
{ "accessToken": "new-access-token", "refreshToken": "new-refresh-token" }
```

Also accepted:

```json
{ "token": "new-access-token", "refreshToken": "new-refresh-token" }
```

Behavior expectations:
- If refresh fails, frontend clears tokens and treats the user as logged out.

---

### 2) Barbers

#### GET `/barbers`

- **200 Response** (either array or `{ items: [] }`)

```json
[
  {
    "id": "jamshid",
    "name": "Jamshid",
    "role": "Senior barber",
    "bio": "Short bio",
    "image": "https://...",
    "stats": { "likes": 0, "dislikes": 0, "followers": 0, "reports": 0 },
    "viewer": { "isFollowing": false }
  }
]
```

#### GET `/barbers/{id}`

- **Path param**: `id` (string)
- **200 Response**: single barber profile, same shape as above.

#### GET `/barbers/{id}/comments?page=1&pageSize=30`

- **200 Response** (either array or `{ items: [] }`; frontend also supports optional `{ meta: { total } }`)

```json
{
  "items": [
    { "id": "c1", "author": "Guest", "text": "Nice barber", "createdAt": "2026-03-04T10:00:00.000Z" }
  ],
  "meta": { "total": 1 }
}
```

Frontend reads:
- `items[]`
- optional `meta.total` (fallback: `items.length`)

#### POST `/barbers/{id}/comments` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**

```json
{ "text": "Nice barber", "author": "Optional display name" }
```

- **200 Response**

```json
{ "id": "c1", "author": "Guest", "text": "Nice barber", "createdAt": "2026-03-04T10:00:00.000Z" }
```

#### POST `/barbers/{id}/like` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **200 Response**

Preferred:

```json
{ "stats": { "likes": 10, "dislikes": 1, "followers": 5, "reports": 0 } }
```

Also accepted (stats directly):

```json
{ "likes": 10, "dislikes": 1, "followers": 5, "reports": 0 }
```

#### POST `/barbers/{id}/dislike` (auth required)

Same expectations as `like`.

#### POST `/barbers/{id}/follow` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **200 Response** (frontend accepts multiple shapes)

Preferred:

```json
{ "isFollowing": true, "followers": 12 }
```

Also accepted:

```json
{ "viewer": { "isFollowing": true }, "stats": { "followers": 12 } }
```

#### DELETE `/barbers/{id}/follow` (auth required)

Same expectations as follow; returns `isFollowing: false`.

#### POST `/barbers/{id}/report` (auth required)

- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**

```json
{ "reason": "spam", "details": "optional extra details" }
```

- **200 Response**: empty or `{ "ok": true }`

---

### 3) Bookings

#### POST `/bookings`

- **Body**

```json
{
  "name": "Customer name",
  "phone": "+998901234567",
  "barberId": "jamshid",
  "date": "2026-03-04",
  "time": "10:00",
  "style": "classic",
  "note": "optional note"
}
```

- **200 Response**: any success body is OK (frontend does not rely on fields yet).

#### GET `/bookings/slots?date=YYYY-MM-DD&barberId={id}`

- **Query params**
  - `date`: string (YYYY-MM-DD)
  - `barberId`: string

- **200 Response** (either array or `{ slots: [] }`)

```json
[
  { "time": "09:00", "available": true },
  { "time": "10:00", "available": false }
]
```

or:

```json
{ "slots": [ { "time": "09:00", "available": true } ] }
```

Notes:
- If `available` is omitted, frontend treats it as `true`.

---

### 4) Contact

#### POST `/contact`

- **Body**

```json
{ "name": "Customer", "phone": "+998901234567", "message": "Hello!" }
```

- **200 Response**: any success body is OK.

---

### 5) Articles

> Note: this page uses `fetch` directly, not `apiRequest`, but the base prefix is still `/api/v1`.

#### GET `/articles?page=1&pageSize=20`

- **200 Response** accepted shapes:
  - `{ "data": [ ... ] }`
  - `{ "data": { "items": [ ... ] } }`
  - `{ "items": [ ... ] }`

Each article item should normalize to:

```json
{
  "id": "a1",
  "title": "Title",
  "summary": "Short summary",
  "content": "Full text",
  "createdAt": "2026-03-04T10:00:00.000Z",
  "updatedAt": "2026-03-04T10:00:00.000Z",
  "authorId": "u1",
  "authorName": "Admin",
  "authorRole": "ADMIN",
  "author": { "id": "u1", "name": "Admin", "userType": "ADMIN" }
}
```

Notes:
- Frontend supports author info either as top-level `authorId/authorName/authorRole` or nested `author`.

#### POST `/articles` (auth required; only ADMIN/BARBER UI can publish)

- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**

```json
{ "title": "Title", "summary": "Short summary", "content": "Full text" }
```

- **200 Response**

Preferred:

```json
{ "data": { "id": "a1", "title": "Title", "summary": "Short summary", "content": "Full text", "createdAt": "2026-03-04T10:00:00.000Z" } }
```

Also accepted: article object directly.

## Non-backend external integration (FYI)

- Telegram send (frontend-only): uses `https://api.telegram.org/bot<TOKEN>/sendMessage` with env vars:
  - `VITE_TELEGRAM_BOT_TOKEN`
  - `VITE_TELEGRAM_CHAT_ID`

