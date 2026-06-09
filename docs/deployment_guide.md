# Deployment Guide

Owner: A

This document is A's deployment evidence document. It must be updated before any deployment-related PR moves to `Need Review`.

## Responsibility

A owns:

```text
docker-compose.yml
nginx/default.conf
.env.example
docs/public_url.md
deployment notes
rollback notes
```

## Local Deployment Requirements

Local Docker Compose should eventually start:

```text
backend
frontend
nginx
```

Required evidence:

```text
docker compose up -d output
backend health URL
frontend URL
nginx URL
known limitations
```

## Nginx Requirements

Nginx should reverse proxy:

```text
/api/ -> backend
/     -> frontend
```

Any Nginx route change must be recorded here.

## Environment Rules

Secrets must not be committed.

Use:

```text
.env.example
.env
```

`.env.example` documents required keys. `.env` stays local.

## Cloud Deployment Requirements

When cloud deployment starts, record:

```text
server provider:
public URL:
backend health URL:
deployment date:
deployment command:
open ports:
known limitations:
```

Also update:

```text
docs/public_url.md
```

## Rollback Plan

Record the rollback approach before final release candidate:

```text
previous compose file:
previous image/tag:
database rollback note:
index rollback note:
fallback local demo:
```

## Acceptance

Pass:

- Local startup steps are documented.
- Nginx proxy behavior is documented.
- Environment variables are documented without secrets.
- Public URL is recorded when cloud deployment exists.

Conditional pass:

- Local Docker works but cloud deployment is not ready.
- Cloud blocker is documented with owner and deadline.

Fail:

- Secrets are committed.
- Deployment steps are missing.
- Public URL is claimed but not recorded.
- No rollback or fallback note exists for release candidate.
