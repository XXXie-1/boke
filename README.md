# boke 博客

一个使用 Next.js 14、TypeScript 和 Supabase 构建的现代化博客平台。支持用户认证、文章管理和自动部署。

## 🚀 特性

- **Next.js 14** 使用 App Router 和 TypeScript
- **Supabase** 用于身份验证和数据库
- **Tailwind CSS** 用于样式设计
- **用户认证** 支持邮箱密码登录
- **文章管理** 支持创建、编辑和发布博客文章
- **数据库迁移** 使用 Supabase CLI
- **CI/CD 流水线** 使用 GitHub Actions
- **Vercel 部署** 开箱即用
- **环境变量** 配置完整
- **测试** 使用 Jest 和 React Testing Library
- **代码检查** 使用 ESLint
- **类型检查** 使用 TypeScript

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

## 🗄️ 数据库架构

博客系统包含以下数据表：

### 用户表 (profiles)
扩展 Supabase 认证系统的用户信息：

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

### 文章表 (posts)
存储博客文章内容：

```sql
CREATE TABLE public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone
);
```

## 🔐 认证系统

应用包含邮箱密码认证功能，提供以下页面：
- `/auth/login` - 登录页面
- `/auth/signup` - 注册页面
- `/api/auth/` - 认证相关的 API 路由

## 📝 博客功能

### 文章管理
- `/` - 博客首页，显示已发布的文章列表
- `/posts/create` - 创建新文章页面
- `/posts/[slug]` - 文章详情页面
- `/api/posts/create` - 创建文章的 API 端点

### 主要特性
- ✅ 用户注册和登录
- ✅ 创建和发布博客文章
- ✅ 文章列表和详情页面
- ✅ 响应式设计，支持移动端
- ✅ 搜索引擎友好的 URL 结构
- ✅ 行级安全策略 (RLS) 保护数据

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