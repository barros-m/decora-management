# AGENT.md — Decora Management (Single-Tenant)

## Stack
- Next.js (App Router) + TypeScript
- Prisma ORM (Postgres)
- TailwindCSS
- Storage: Vercel Blob (store URL in DB)
- Calendar: Google Calendar integration (holds + booked)

## Single-tenant assumptions
- There is exactly one business/tenant.
- No tenant scoping required in queries.
- Authorization is role-based (OWNER/ADMIN/USER).

## Architecture rules
- Server-only code in `/src/server/*`:
  - `/src/server/db.ts` (Prisma client)
  - `/src/server/repositories/*` (data access)
  - `/src/server/services/*` (business rules + state transitions)
  - `/src/server/integrations/*` (Blob, Google Calendar)
- UI in `/src/app/*` and `/src/components/*`
- Do not call Prisma directly from React components.
- All mutations go through server actions or route handlers that call services.

Layering:
Route Handler / Server Action
  -> Service (validations + transitions + side effects)
  -> Repository (Prisma)
  -> ActivityLog (always for major changes)

## Domain entities
Core:
- Inquiry (lead)
- Proposal (versioned) + Packages + Line Items
- Booking (calendar hold/booked)
- EventProject (execution)
- TaskTemplate + Items
- Task
- Vendor + VendorNeed
- Communication (manual email log / notes)
- Attachment (Vercel Blob URLs)
- ActivityLog (audit trail)

## State machine enforcement
Statuses are state machines. Do not set statuses ad-hoc.

Implement validators:
- `assertInquiryTransition(from, to)`
- `assertProposalTransition(from, to)`
- `assertBookingTransition(from, to)`
- `assertEventTransition(from, to)`
- `assertTaskTransition(from, to)`

Every valid transition must:
- Write the domain change
- Insert an `ActivityLog` record (`type`, `message`, `data`)
- Trigger side-effects where applicable (calendar updates, task generation)

## Calendar integration (MVP)
- Booking stores: `calendarId`, `calendarEventId`, `calendarKind`
- Integration module: `/src/server/integrations/googleCalendar.ts`
- Only Booking services call calendar integration.

Service APIs:
- `createTentativeHold(inquiryId)`
- `markBooked(inquiryId | bookingId)`
- `cancelHold(inquiryId | bookingId)`
- `reschedule(bookingId, newStartAt, newEndAt)`

Calendar mapping:
- `TENTATIVE_HOLD` -> calendar kind `HOLD` (separate calendar or title prefix)
- `BOOKED` -> calendar kind `BOOKED`

## Storage (Vercel Blob)
- Upload path convention:
  - `attachments/inquiries/{inquiryId}/{uuid}-{filename}`
  - `attachments/proposals/{proposalId}/{uuid}-{filename}`
  - `attachments/events/{eventId}/{uuid}-{filename}`
  - `attachments/tasks/{taskId}/{uuid}-{filename}`
- Store Blob URL in `Attachment.url`

Security:
- Admin-only uploads (management app).
- If public uploads are introduced, enforce:
  - file type allowlist
  - max size
  - rate limiting
  - virus scanning (optional later)

## MVP flows to support
1) Public inquiry submit -> create Inquiry + Booking(TentativeHold) + notify admins + email client
2) Admin triage -> assign inquiry, request more info, log comms
3) Proposal create/send -> versioning, follow-up reminder, log activity
4) Admin records email response -> accepted/rejected/needs changes
5) Book -> convert to EventProject + generate tasks from template + calendar update
6) Planning -> tasks + vendor needs tracking + attachments
7) Closeout -> completed + notes + review request logged

## UI pages (suggested)
- `/inquiries` list + filters
- `/inquiries/[id]` detail (timeline, proposal list, booking section)
- `/inquiries/[id]/proposal/new` create proposal
- `/events` list/calendar view
- `/events/[id]` event project (tasks, vendor needs, attachments)
- `/vendors` vendor directory
- `/templates/tasks` manage task templates

## Coding standards
- TypeScript strict.
- Zod validation in handlers/actions.
- Use Prisma transactions for multi-step operations (status change + activity + side effects).
- Keep reads lightweight (avoid deep `include` chains).
- Prefer idempotent integration calls where possible.

## Commands
- `npx prisma migrate dev`
- `npx prisma studio`
- `npm run dev`
- `npm run lint`