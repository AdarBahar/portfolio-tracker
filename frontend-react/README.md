# Fantasy Broker - React Frontend (Feasibility Test)

This is a React + Vite + TypeScript implementation of the Fantasy Broker frontend for feasibility testing.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with design tokens
- **React Router v6** - Client-side routing
- **React Query v5** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
src/
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── TradeRoom.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
├── lib/
│   └── api.ts        # API client configuration
├── App.tsx           # Main app component with routing
├── main.tsx          # Entry point
└── index.css         # Tailwind CSS directives
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
```

## Features Implemented

- ✅ React Router setup with multiple pages
- ✅ Tailwind CSS with design system tokens
- ✅ React Query for API state management
- ✅ API client with error handling
- ✅ Sample pages (Dashboard, Trade Room, Admin)
- ✅ Responsive design
- ✅ Dark theme with brand colors
