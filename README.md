# Power Patch Tracker

Build a complete, modern, responsive frontend-only web application called Power-Track — Electricity Complaint Management System, following all specifications in the attached document:

### Project Overview
Power-Track allows consumers to report electricity-related problems, track complaints, and view updates. Administrators manage complaints and assign them to field workers, while field workers update progress and upload completion evidence.

### Tech Stack
- React.js with TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide icons
- Mock data for all frontend functionality with localStorage persistence

### Design Requirements
- Use a clean, professional, modern dashboard design.
- Do not use gradients anywhere.
- Use a simple color palette: white backgrounds, light gray surfaces, dark navy text, and electric blue accents.
- Use consistent spacing, typography, borders, subtle shadows, and rounded corners.
- Make the interface responsive for desktop, tablet, and mobile.
- Use a professional electricity utility theme with relevant icons.
- Avoid unnecessary animations, excessive colors, and decorative elements.

### Pages and Features
1. Authentication: Login, Registration, Role-based demo login (Consumer, Administrator, Field Worker), and Forgot Password.
2. Consumer Dashboard: Overview stats, recent complaints table, status badges, quick submit action, activity timeline.
3. Submit Complaint: Category selection (Damaged Meter, Fallen Pole, Broken Wire, Transformer Issue, Connection Issue, Power Outage, Other), title/description, address, image upload preview, priority info, AI-assisted suggestion simulation UI, similar complaint warning UI, mock ID generation.
4. My Complaints: Searchable/filterable table, detail view with status history and assigned worker info, clear status progression (Submitted -> Under Review -> Assigned -> In Progress -> Resolved).
5. Administrator Dashboard: Statistics cards, full complaints management table with filters/sorting/pagination, detail & review modal/page, priority management, field worker assignment, duplicate complaint review, user/worker management, analytics charts.
6. Field Worker Dashboard: Assigned complaints overview, task list with priority/location, detail view, progress/status updates, work notes, before/after evidence upload, mark resolved.
7. Notifications: Dropdown / list with read/unread states and mock updates.
8. Additional Pages: Landing page explaining Power-Track, Profile & Settings page, 404 page.

Include a global role switcher/demo toolbar so any role can be previewed seamlessly, and ensure mock state changes persist in localStorage.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://power-patch-tracker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2d7dbec1-6cb4-4aa1-9eb4-126d1863a75e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
