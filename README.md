# Next.js 14 App with TypeScript and Tailwind CSS

A modern Next.js 14 application bootstrapped with TypeScript, Tailwind CSS, ESLint, and Prettier.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (specified in `.nvmrc`)
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Copy the environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── health/            # Health check API route
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions and helpers
├── styles/               # Global styles and CSS
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system
- **Code Quality**: ESLint + Prettier
- **Development**: Hot Module Replacement, Fast Refresh

## 🌟 Features

- ✅ TypeScript strict mode enabled
- ✅ Tailwind CSS with custom color palette and components
- ✅ ESLint and Prettier integration
- ✅ Path aliases configured (`@/components/*`, `@/lib/*`, etc.)
- ✅ Health check endpoint at `/health`
- ✅ Responsive design with mobile-first approach
- ✅ Dark mode support (CSS variables ready)
- ✅ Component library with Button and Card components

## 📝 Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `RATE_LIMIT_MAX_REQUESTS` - Rate limiting configuration
- `VERCEL_ENV` - Deployment environment

## 🚀 Deployment

This project is ready for deployment on Vercel:

```bash
npm run build
```

The build command creates an optimized production build in the `.next` folder.

## 📊 Health Check

The application includes a health check endpoint:

```
GET /health
```

Returns:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 🎨 Design System

The project includes a custom Tailwind CSS configuration with:

- Custom color palette (primary, gray, accent)
- Custom font stack (Inter, JetBrains Mono)
- Extended spacing scale
- Custom animations and transitions
- Reusable component classes

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
