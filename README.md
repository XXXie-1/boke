# Vercel + Supabase Starter Kit

A modern full-stack web application starter kit built with Next.js 14, TypeScript, and Supabase. This template provides authentication, database management, and deployment-ready configuration for Vercel.

## 🚀 Features

- **Next.js 14** with App Router and TypeScript
- **Supabase** for authentication and database
- **Tailwind CSS** for styling (ready to add)
- **Authentication** with email/password
- **Database migrations** with Supabase CLI
- **CI/CD pipeline** with GitHub Actions
- **Vercel deployment** ready
- **Environment variables** configuration
- **Testing** with Jest and React Testing Library
- **Linting** with ESLint
- **Type checking** with TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account
- GitHub account

## 🛠️ Quick Start

Get your Vercel + Supabase application running in minutes:

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd your-project-name
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

You'll need to get these values from your Supabase project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
4. Link your local project to Supabase:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🗄️ Database Schema

The starter kit includes a `profiles` table that extends Supabase auth:

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  username text UNIQUE,
  website text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

## 🔐 Authentication

The app includes email/password authentication with the following pages:
- `/auth/login` - Sign in page
- `/auth/signup` - Sign up page
- API routes at `/api/auth/` for auth operations

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:migrate` - Push database changes to Supabase
- `npm run db:reset` - Reset local database
- `npm run db:generate` - Generate TypeScript types from database
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance

## 🚀 Deployment

### One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo-name)

### Manual Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Environment Variables for Production

Required environment variables for Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | ❌ |

## 🔧 Configuration

### Supabase Configuration

Supabase configuration is in `supabase/config.toml`. Update the `project_id` and other settings as needed.

### Vercel Configuration

Vercel configuration is in `vercel.json`. This includes:
- Build settings
- Environment variable descriptions
- Function timeout settings

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes:

1. **Linting** - Runs ESLint
2. **Type checking** - Runs TypeScript compiler
3. **Testing** - Runs Jest test suite
4. **Building** - Builds the Next.js app
5. **Deployment** - Deploys to Vercel (main branch)
6. **Database migrations** - Runs Supabase migrations (main branch)

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `SUPABASE_ACCESS_TOKEN` - Your Supabase access token
- `SUPABASE_PROJECT_REF` - Your Supabase project reference

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
├── __tests__/               # Test files
├── src/
│   ├── lib/                 # Utility functions
│   │   ├── server-supabase.ts
│   │   └── supabase.ts
│   ├── pages/               # Next.js pages
│   │   ├── api/
│   │   │   └── auth/        # Auth API routes
│   │   ├── auth/            # Auth pages
│   │   └── index.tsx
│   └── types/
│       └── database.ts      # Database type definitions
├── supabase/
│   ├── config.toml          # Supabase config
│   └── migrations/          # Database migrations
├── .env.example             # Environment variables template
├── .eslintrc.json          # ESLint config
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest config
├── jest.setup.js           # Jest setup
├── next.config.js          # Next.js config
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── vercel.json            # Vercel config
└── README.md              # This file
```

## 🛡️ Security

- Row Level Security (RLS) is enabled on all tables
- Environment variables are properly configured
- API routes include proper error handling
- Supabase auth helpers are used for secure authentication

## 📚 Development Workflow

1. Create a new feature branch: `git checkout -b feature-name`
2. Make your changes
3. Run tests and linting: `npm run test && npm run lint`
4. Commit your changes: `git commit -m "feat: add feature"`
5. Push to GitHub: `git push origin feature-name`
6. Create a pull request
7. CI/CD pipeline will run automatically
8. Merge to main branch to deploy

## 🔍 Moderation Usage

This starter kit includes basic user management features. For content moderation:

1. Add moderation tables to your database schema
2. Create admin-only API routes for moderation actions
3. Implement role-based access control using Supabase policies
4. Add moderation UI components

Example moderation schema:

```sql
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES auth.users(id),
  content_type text,
  content_id uuid,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Check your environment variables
   - Ensure Supabase project is active
   - Verify network connectivity

2. **Migration failures**
   - Run `supabase db reset` to reset local database
   - Check migration SQL syntax
   - Ensure you have proper permissions

3. **Vercel deployment issues**
   - Verify all environment variables are set
   - Check build logs for errors
   - Ensure Vercel has access to your repository

4. **Authentication issues**
   - Check Supabase auth settings
   - Verify redirect URLs in Supabase dashboard
   - Ensure proper cookie configuration

## 📝 License

MIT License - feel free to use this template for your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you run into any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

---

Built with ❤️ using Next.js and Supabase