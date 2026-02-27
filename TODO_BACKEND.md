# Backend API Contract For Usta Frontend

This document is the API spec for backend implementation.  
Frontend pages depending on this: `ContactPage`, `BookingPage`, `BarbersPage`, `ArticlePage`, auth modal/profile.

## 1. Global Rules

### Base URL
- `{{API_BASE_URL}}/api/v1`

### Content Type
- Request: `application/json`
- Response: `application/json`

### Auth
- `Authorization: Bearer <access_token>`
- Roles used by frontend: `USER`, `BARBER`, `ADMIN`

### Date/Time
- Use ISO 8601 (`createdAt`, `updatedAt`)
- Booking `date`: `YYYY-MM-DD`
- Booking `time`: `HH:mm` (24h)

### Standard Response Shape
```json
{
  "data": {},
  "meta": {}
}
```

### Standard Error Shape
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "fields": {
      "name": "REQUIRED"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` -> `400`
- `UNAUTHORIZED` -> `401`
- `FORBIDDEN` -> `403`
- `NOT_FOUND` -> `404`
- `CONFLICT` -> `409`
- `RATE_LIMITED` -> `429`
- `INTERNAL_ERROR` -> `500`

## 2. Authentication APIs

### `POST /auth/signup`
- Public
- Creates account
- Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123",
  "userType": "USER"
}
```
- Response `201`
```json
{
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt_or_token",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "USER",
      "image": null
    }
  }
}
```

### `POST /auth/login`
- Public
- Request
```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```
- Response `200` same shape as signup

### `GET /auth/me`
- Auth required
- Response `200`
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "USER",
    "image": null
  }
}
```

### `POST /auth/refresh`
- Public with refresh token
- Returns new access token

### `POST /auth/logout`
- Auth required
- Invalidates refresh token/session

## 3. Contact APIs

### `POST /contact`
- Public
- Purpose: replace direct Telegram call from frontend
- Request
```json
{
  "name": "Ali",
  "phone": "+998901234567",
  "message": "I need help selecting service"
}
```
- Response `201`
```json
{
  "data": {
    "id": "uuid",
    "status": "received",
    "createdAt": "2026-02-27T10:20:30.000Z"
  }
}
```
- Notes
- Backend should enqueue/send notification (Telegram/CRM) server-side.
- Rate limit by IP and phone.

## 4. Booking APIs

### `GET /bookings/slots?date=YYYY-MM-DD&barberId={id}`
- Public
- Returns available time slots
- Response `200`
```json
{
  "data": {
    "barberId": "jamshid",
    "date": "2026-03-01",
    "slots": [
      { "time": "09:00", "available": true },
      { "time": "10:00", "available": false }
    ]
  }
}
```

### `POST /bookings`
- Public (guest booking allowed)
- Request
```json
{
  "name": "Ali",
  "phone": "+998901234567",
  "barberId": "jamshid",
  "date": "2026-03-01",
  "time": "10:00",
  "style": "fade",
  "note": "Please keep top longer"
}
```
- Response `201`
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2026-02-27T10:20:30.000Z"
  }
}
```
- Conflict response `409`
```json
{
  "error": {
    "code": "SLOT_TAKEN",
    "message": "Selected slot is already booked"
  }
}
```

### `GET /bookings/me`
- Auth required
- Returns current user bookings for profile page
- Response `200`
```json
{
  "data": [
    {
      "id": "uuid",
      "barberId": "jamshid",
      "date": "2026-03-01",
      "time": "10:00",
      "style": "fade",
      "status": "pending"
    }
  ]
}
```

## 5. Barber APIs

### `GET /barbers`
- Public
- Response should include base profile + stats used by list cards
```json
{
  "data": [
    {
      "id": "jamshid",
      "name": "Jamshid",
      "role": "Senior Barber",
      "bio": "....",
      "image": "/images/barbers/1.webp",
      "stats": {
        "likes": 94,
        "dislikes": 3,
        "followers": 243
      }
    }
  ]
}
```

### `GET /barbers/:id`
- Public
- Returns single barber profile + current stats + my state flags
```json
{
  "data": {
    "id": "jamshid",
    "name": "Jamshid",
    "role": "Senior Barber",
    "bio": "....",
    "image": "/images/barbers/1.webp",
    "stats": {
      "likes": 94,
      "dislikes": 3,
      "followers": 243,
      "reports": 0
    },
    "viewer": {
      "isFollowing": false
    }
  }
}
```

### `GET /barbers/:id/comments?page=1&pageSize=20`
- Public
- Response
```json
{
  "data": [
    {
      "id": "uuid",
      "author": "Ali",
      "text": "Great service",
      "createdAt": "2026-02-27T10:20:30.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 34
  }
}
```

### `POST /barbers/:id/comments`
- Auth required (`USER|BARBER|ADMIN`)
- Request
```json
{
  "author": "Ali",
  "text": "Great service"
}
```
- Response `201`: created comment

### `POST /barbers/:id/like`
- Auth required
- Increments or toggles user's positive reaction
- Response should return updated stats

### `POST /barbers/:id/dislike`
- Auth required
- Increments or toggles user's negative reaction
- Response should return updated stats

### `POST /barbers/:id/follow`
- Auth required
- Response `200`
```json
{
  "data": {
    "isFollowing": true,
    "followers": 244
  }
}
```

### `DELETE /barbers/:id/follow`
- Auth required
- Response `200`
```json
{
  "data": {
    "isFollowing": false,
    "followers": 243
  }
}
```

### `POST /barbers/:id/report`
- Auth required
- Request
```json
{
  "reason": "spam",
  "details": "optional additional text"
}
```
- `reason` enum: `spam | offensive | other`
- Response `201`
```json
{
  "data": {
    "id": "uuid",
    "status": "received"
  }
}
```

## 6. Article APIs

Frontend rule: only `ADMIN` and `BARBER` can publish; everyone can read.

### `GET /articles?page=1&pageSize=10`
- Public
- Response
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "How To Keep Your Fade Sharp",
      "summary": "Short summary",
      "content": "Full content",
      "authorId": "uuid",
      "authorName": "Usta Admin",
      "authorRole": "ADMIN",
      "createdAt": "2026-02-27T10:20:30.000Z",
      "updatedAt": "2026-02-27T10:20:30.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 2
  }
}
```

### `GET /articles/:id`
- Public
- Response: single article object

### `POST /articles`
- Auth required (`ADMIN|BARBER`)
- Request
```json
{
  "title": "How To Keep Your Fade Sharp",
  "summary": "Short summary",
  "content": "Full content"
}
```
- Response `201`: created article

### `PATCH /articles/:id`
- Auth required (`ADMIN` or article author)
- Request: any subset of `title`, `summary`, `content`

### `DELETE /articles/:id`
- Auth required (`ADMIN` or article author)
- Response `204`

## 7. Validation Rules

### Auth
- `name`: 2..100 chars
- `email`: valid email format, unique
- `password`: min 8 chars
- `userType`: `USER|BARBER|ADMIN` (for production, consider restricting direct `ADMIN` signup)

### Contact
- `name`: required, 2..100
- `phone`: required, 7..20
- `message`: required, 5..2000

### Booking
- `name`: required, 2..100
- `phone`: required, 7..20
- `barberId`: required, existing barber id
- `date`: required, today or future
- `time`: required, valid slot
- `style`: required (`classic|fade|beard|deluxe|color|fatherSon`)
- `note`: optional, max 1000

### Comments/Reports
- `text`: 1..1000
- `author`: optional, max 100
- report `reason`: required enum

### Articles
- `title`: 5..160
- `summary`: 10..300
- `content`: 30..20000

## 8. Rate Limits And Security
- `POST /contact`: 5 req / 10 min per IP
- `POST /bookings`: 5 req / 10 min per phone + IP
- `POST /barbers/:id/comments`: 10 req / 10 min per user
- `POST /barbers/:id/report`: 3 req / 24h per user per barber
- JWT expiration + refresh rotation
- Audit log for report actions

## 9. Delivery Priority (Implementation Order)

### Phase 1 (must-have to unblock frontend)
1. Auth: `signup`, `login`, `me`
2. Contact: `POST /contact`
3. Bookings: `POST /bookings`, `GET /bookings/slots`, `GET /bookings/me`
4. Barbers: `GET /barbers`, `GET /barbers/:id`, comments, like/dislike, follow/unfollow, report
5. Articles: `GET /articles`, `POST /articles`

### Phase 2
1. Article update/delete
2. Admin moderation APIs for reports/comments/bookings
3. Analytics + observability dashboards
