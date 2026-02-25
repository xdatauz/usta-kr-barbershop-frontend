# TODO: Backend Integration

## 1. Environment and API base
- [ ] Add `VITE_API_BASE_URL` and switch frontend service calls to this base URL.
- [ ] Keep Telegram env vars only as fallback for development mode.

## 2. Contact form
- [ ] Create `POST /api/contact` endpoint.
- [ ] Validate payload: `name`, `phone`, `message`.
- [ ] Return localized-friendly error codes for UI mapping.
- [ ] Move Telegram delivery to backend worker/service.

## 3. Booking flow
- [ ] Create `POST /api/bookings` endpoint.
- [ ] Add `GET /api/bookings/slots?date=...&barberId=...` for real available times.
- [ ] Validate fields: `name`, `phone`, `barberId`, `date`, `time`, `style`.
- [ ] Persist bookings in DB and add conflict checks.
- [ ] Add `GET /api/bookings/me` for user profile booking history.

## 4. Barbers and profiles
- [ ] Create `GET /api/barbers` and `GET /api/barbers/:id` endpoints.
- [ ] Create `POST /api/barbers/:id/comments` and `GET /api/barbers/:id/comments`.
- [ ] Create `POST /api/barbers/:id/like` and `POST /api/barbers/:id/dislike`.
- [ ] Create `POST /api/barbers/:id/follow` and `DELETE /api/barbers/:id/follow`.
- [ ] Create `POST /api/barbers/:id/report` with reason and moderation queue.

## 5. Auth and permissions
- [ ] Replace localStorage-only auth with backend JWT/session auth.
- [ ] Require auth for comment, follow, like/dislike, report.
- [ ] Add rate limiting for report/comment endpoints.

## 6. Frontend refactor after API is ready
- [ ] Replace localStorage state in `BarbersPage` with fetch/query hooks.
- [ ] Replace direct Telegram send in `ContactPage` and `BookingPage` with API requests.
- [ ] Add loading/skeleton and retry UI for API failures.
- [ ] Add optimistic updates for like/follow with rollback on error.

## 7. Observability and quality
- [ ] Add backend request logging and error tracking.
- [ ] Add integration tests for booking, contact, and barber interactions.
- [ ] Add analytics events for booking funnel and contact submissions.
