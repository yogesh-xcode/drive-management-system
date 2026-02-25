# Project Flow - Drive Management System

## 1) What this project is

Drive Management System is a recruitment operations app that centralizes:

- staff management
- candidate pipeline tracking
- client program tracking
- hiring drive execution
- dashboard analytics

It is built with Next.js App Router + React + TypeScript, uses Supabase for auth/data, and uses reusable table CRUD screens for all entities.

## 2) Core problem it solves

Teams usually manage hiring operations across spreadsheets and disconnected tools, causing:

- inconsistent records
- poor visibility into conversion/offer/performance
- slow updates and reporting
- no unified workflow for staff/candidate/client/drive data

This project solves that by providing:

- one authenticated workspace
- one common table workflow (search/filter/sort/paginate/add/edit/delete/export)
- one analytics surface for cross-entity visibility

## 3) End-to-end app flow (high level)

```text
+------------------+
|  Public Landing  |
|      "/"         |
+--------+---------+
         |
         v
+------------------+
| Login / Signup   |
|    "/login"      |
+--------+---------+
         |
         v
+------------------------------+
| Authenticated Application    |
| Sidebar + Header + Main Area |
+---+------+-------+------+----+
    |      |       |      |
    v      v       v      v
 Dashboard Staff Candidate Client Drive
```

## 4) Global authenticated layout wireframe

Used by dashboard + all entity pages.

```text
+----------------------------------------------------------------------------------+
| [Sidebar: logo, quick create, nav links, user] | [Sticky Header: Page Title]    |
|                                                 |                                 |
|                                                 | [Cards / KPIs]                  |
|                                                 |                                 |
|                                                 | [Table Toolbar]                 |
|                                                 |  Search | Add | Filter | Export |
|                                                 |                                 |
|                                                 | [Data Table]                    |
|                                                 |  Sortable headers               |
|                                                 |  Zebra rows                     |
|                                                 |  Edit/Delete                    |
|                                                 |                                 |
|                                                 | [Pagination]                    |
+----------------------------------------------------------------------------------+
```

What this layout solves:

- consistent navigation across modules
- lower learning curve due to repeatable page structure
- fast context switching between entities

## 5) Wireframe by wireframe

### Wireframe A: Landing Page (`/`)

```text
+----------------------------------------------------------------------------------+
|                               Hero Headline                                      |
|                        "Empower ... HR Operations"                               |
|                    [Get Started]   [Sign Up]                                     |
|----------------------------------------------------------------------------------|
| FEATURES (3 selectable cards)                                                   |
| [Unified Records] [Program & Client] [Advanced Table Actions]                   |
|----------------------------------------------------------------------------------|
| FAQ (accordion)                                                                  |
| Q/A rows                                                                          |
+----------------------------------------------------------------------------------+
```

What it solves:

- communicates value before login
- directs users quickly to dashboard/login
- reduces onboarding friction with features + FAQ

### Wireframe B: Auth Page (`/login`) with 3 states

```text
+-------------------------------------------+
|              Manpower Drive               |
| +---------------------------------------+ |
| | Card: Login / Signup / Forgot         | |
| | Inputs (email/password/name)          | |
| | Primary submit button                 | |
| | Google / Azure OAuth                  | |
| +---------------------------------------+ |
| Dialog modal for success/error feedback   |
+-------------------------------------------+
```

What it solves:

- supports full auth lifecycle in one place
- supports both password and OAuth sign-in
- gives immediate modal feedback for errors/success

### Wireframe C: Dashboard (`/dashboard`)

```text
+----------------------------------------------------------------------------------+
| Header: Dashboard                                                                 |
|----------------------------------------------------------------------------------|
| [Company Overview Area Chart: staff/programs/candidates/drives over time]       |
|----------------------------------------------------------------------------------|
| KPI Grid (6 cards):                                                               |
| [Total Programs] [Department Mix] [Candidate Conversion]                         |
| [New Clients]   [Staff Tenure]   [Offer Rate]                                    |
+----------------------------------------------------------------------------------+
```

What it solves:

- gives leadership a single operational snapshot
- surfaces hiring health and trend direction quickly
- supports planning with month-wise aggregate trends

### Wireframe D: Staff Module (`/staff`)

```text
+----------------------------------------------------------------------------------+
| Header: Staff                                                                      |
| [Dept Distribution Card] [Tenure Card] [Go to Dashboard Card]                     |
|----------------------------------------------------------------------------------|
| Toolbar: [Search] [Add Staff] [Filter/Clear] [Export staff]                      |
|----------------------------------------------------------------------------------|
| Table: ID | Name | Dept | Email | Joined Date | Actions                           |
| Rows: zebra striping + edit/delete                                                 |
| Empty/filler rows keep table height stable                                         |
| Pagination                                                                          |
+----------------------------------------------------------------------------------+
```

What it solves:

- central employee record lifecycle
- quick update/delete operations
- CSV extraction for reporting/compliance

### Wireframe E: Candidate Module (`/candidate`)

```text
+----------------------------------------------------------------------------------+
| Header: Candidates                                                                 |
| [Status Conversion Card] [Offer Rate Card] [Go to Dashboard Card]                |
|----------------------------------------------------------------------------------|
| Toolbar: [Search] [Add Candidate] [Filter/Clear] [Export candidate]              |
|----------------------------------------------------------------------------------|
| Table: ID | Candidate | Role | Status | Applied Date | ... | Actions             |
| Rows: sortable, filterable, zebra striped                                          |
| Pagination                                                                          |
+----------------------------------------------------------------------------------+
```

Special flow solved:

- supports Quick Create from sidebar using `?add=1` deep link
- reduces clicks for urgent candidate entry

### Wireframe F: Client Programs Module (`/client`)

```text
+----------------------------------------------------------------------------------+
| Header: Client Programs                                                            |
| [Total Programs Card] [New Clients Card] [Go to Dashboard Card]                  |
|----------------------------------------------------------------------------------|
| Toolbar: [Search] [Add Program] [Filter/Clear] [Export client]                   |
|----------------------------------------------------------------------------------|
| Table: Program No | Client | Program | Date | ... | Actions                       |
| Pagination                                                                          |
+----------------------------------------------------------------------------------+
```

What it solves:

- tracks business-side program intake and growth
- ties client activity to hiring operations visibility

### Wireframe G: Drives Module (`/drive`)

```text
+----------------------------------------------------------------------------------+
| Header: Drives                                                                     |
| [Total Drives Card] [Scheduled/Upcoming Card] [Go to Dashboard Card]             |
|----------------------------------------------------------------------------------|
| Toolbar: [Search] [Add Drives] [Filter/Clear] [Export drive]                     |
|----------------------------------------------------------------------------------|
| Table: ID | Drive Title | Location | Status | Date | Actions                      |
| Status chips (Scheduled/Ongoing/Completed)                                        |
| Pagination                                                                          |
+----------------------------------------------------------------------------------+
```

What it solves:

- operational control for hiring event execution
- quick status monitoring across drive timeline

## 6) Shared table workflow (used in all entity modules)

```text
User opens module
  -> fetch rows from Supabase
  -> local sort/filter/search
  -> paginate rows
  -> user can Add/Edit/Delete
  -> refresh data
  -> user can Export CSV
```

What this shared workflow solves:

- standard UX across domains
- less training cost for ops users
- reusable engineering model for future entities

## 7) Data and service mapping

```text
client_data    <-> clientDataService   (id: programNo)
staff_data     <-> staffDataService    (id: id)
candidate_data <-> candidateDataService(id: id)
drive_data     <-> driveDataService    (id: id)
```

Generic service responsibilities:

- `get`, `getRow`, `create`, `update`, `destroy`

## 8) Business outcomes enabled

- Faster HR operations by removing spreadsheet context switching
- Better hiring visibility with conversion/offer/department/tenure metrics
- Better reporting with one-click exports
- Better consistency with one UI pattern and one data access pattern

## 9) Future-ready extension points

- move table pagination/filter/sort to server side for large data
- add role-based access controls
- add audit trails for CRUD actions
- add drill-down from KPI cards to filtered table views
