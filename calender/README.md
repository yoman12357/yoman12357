# Interactive Wall Calendar Component

An enhanced version of an original frontend engineering challenge to build an interactive wall calendar component.  
The project evolves the brief into a polished, production-minded experience with stronger UX, richer interactivity, accessibility improvements, and real-world usability features such as notes, reminders, responsive behavior, and adaptive theming.

## Features

### Core Features

- Wall calendar layout with a hero image and month-view calendar grid
- Date range selection with clear start, end, and in-between highlighting
- Notes system with create, edit, delete, and localStorage persistence
- Fully responsive layout for desktop and mobile, with touch-friendly interaction

### Advanced Features

- Drag-to-select date range interaction inspired by booking experiences
- Reminders with browser notifications and in-app fallback alerts
- Highlighted important dates for today, notes, reminders, and special dates
- Smooth animations and transitions powered by Framer Motion
- Light and dark mode with persisted preference
- Dynamic accent colors influenced by the hero image
- Quick actions including Today, Clear Selection, Select This Week, and month navigation
- Smooth animated transitions between months
- Sticky notes panel on desktop to reduce context switching
- Timezone-aware reminder handling
- Edge case handling for reversed ranges, invalid selections, empty input, and permission denial
- Accessibility improvements including keyboard navigation, visible focus states, and screen-reader-friendly labels

## UX Improvements

- Clean visual hierarchy with a premium split-layout composition
- High-contrast styling with extra care for dark mode readability
- Smooth interaction feedback through toasts, hover states, focus states, and subtle motion
- Mobile-friendly spacing, touch targets, and stacked responsive layout behavior

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- date-fns
- localStorage for client-side persistence

## Demo

- Live demo: `Add your deployment link here`
- Video demo script: [`docs/video-demo-script.md`](docs/video-demo-script.md)
- Submission summary: [`docs/submission-description.md`](docs/submission-description.md)
- Project report: [`docs/project-report.md`](docs/project-report.md)
- PDF report: [`docs/project-report.pdf`](docs/project-report.pdf)

## Installation

1. Clone the repository.
2. Move into the project directory.

```bash
cd calender
```

3. Install dependencies.

```bash
npm install
```

4. Start the development server.

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser.

Optional quality checks:

```bash
npm run lint
npm run build
```

## Design Decisions

- **Why the wall calendar concept:** A wall calendar gives the challenge a stronger product identity than a standard date picker. The hero image plus month grid creates a more memorable, portfolio-ready interface while still keeping the calendar familiar.
- **Why localStorage instead of a backend:** The challenge is frontend-focused, so localStorage keeps the app self-contained, instantly usable, and easy to review without requiring auth, APIs, or deployment infrastructure.
- **Why usability was prioritized:** The extended build focuses on real-world interaction quality through drag selection, quick actions, sticky notes, reminders, responsive touch behavior, keyboard navigation, and clear feedback states.

## Future Improvements

- Backend integration for syncing notes, reminders, and calendar state
- User authentication and personalized accounts
- Cloud-based reminders with background delivery
- Multi-user collaboration and shared planning workflows
