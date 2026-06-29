# API Contract Matrix (Phase 1 Baseline)

This file tracks the frontend API contract expected by NextBlog during Cloudflare migration.

## Auth

- `POST /api/auth/register` - body: `email,nickname,password,code` - returns: `token`
- `POST /api/auth/send-code` - body: `email` - returns: `{ ok: boolean }`
- `POST /api/auth/login` - body: `email,password` - returns: `token`
- `GET /api/auth/me` - auth: `Authorization: Bearer <token>` - returns user profile
- `PUT /api/auth/profile` - auth required - returns updated profile
- `POST /api/auth/avatar` - auth required, form-data - returns updated profile
- `POST /api/auth/banner` - auth required, form-data - returns updated profile
- `GET /api/auth/users` - admin auth required - returns user list

### Auth status semantics (Batch 2)

- `401`: missing/invalid bearer token or wrong credentials
- `403`: authenticated but forbidden (for example non-admin requesting `/api/auth/users`)
- `409`: email already registered
- `429`: send-code rate limited

### Production site URL

- Worker `SITE_URL`: `https://n4gasaki.icu`

## Posts and RSS

- `GET /api/posts?page=<n>&page_size=<n>` - returns `{ items,total,page,page_size }`
- `GET /api/posts/{id}` - returns post detail with markdown
- `GET /rss.xml` - returns XML feed

## Comments

- `GET /api/comments?threadId=<id>&page=<n>&pageSize=<n>` - returns comment list
- `POST /api/comments` - auth required - returns created comment
- `DELETE /api/comments/{id}` - admin auth required

## Users

- `GET /api/users/{id}` - returns public profile

## Tutorial

- `GET /api/tutorials/{key}` - returns tutorial content and steps
- `GET /api/tutorial/{key}?version=<n>` - auth required - returns completion state
- `POST /api/tutorial/{key}/complete` - auth required - returns completion result

## Inspect

- `GET /api/creeper` - returns `{ process_name, timestamp, recent[] }`

## Phase 1 Disabled

- Watch and media preparation routes are disabled in phase 1 migration and return HTTP `410` with `error=feature-disabled`.
