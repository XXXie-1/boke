# boke 博客部署指南

本指南将帮助您将 boke 博客部署到 Vercel 平台，并配置 Supabase 数据库。

## 🚀 快速部署

### 1. 准备工作

确保您已经拥有：
- GitHub 账号
- Vercel 账号
- Supabase 账号和项目
- 本地开发环境（Node.js 18+）

### 2. 环境变量配置

在部署之前，您需要在 Vercel 中配置以下环境变量：

#### 必需的环境变量

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### 3. Vercel 部署步骤

#### 方法一：通过 Vercel 网页界面

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择您的 GitHub 仓库：`XXXie-1/boke`
   - 点击 "Import"

3. **配置环境变量**
   - 在项目设置页面，点击 "Environment Variables"
   - 添加上述三个必需的环境变量
   - 确保所有变量都正确设置

4. **部署项目**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 5-10 分钟）
   - 获得部署链接：`https://boke-xxxx.vercel.app`

#### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. 数据库设置

#### 运行数据库迁移

1. **安装 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **链接到 Supabase 项目**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **推送迁移到生产环境**
   ```bash
   supabase db push
   ```

### 5. 验证部署

部署完成后，请验证以下功能：

- [ ] 博客首页能够正常加载
- [ ] 用户注册和登录功能正常
- [ ] 能够创建和发布新文章
- [ ] 文章详情页面显示正常
- [ ] 响应式设计在移动端正常工作

## 🔧 配置详解

### Vercel 配置文件

项目包含 `vercel.json` 配置文件，定义了：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": {
      "description": "Supabase project URL",
      "required": true
    },
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": {
      "description": "Supabase anonymous public key",
      "required": true
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "description": "Supabase service role key (for migrations)",
      "required": false
    }
  },
  "functions": {
    "src/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### GitHub Actions CI/CD

项目配置了自动化的 CI/CD 流水线（`.github/workflows/ci.yml`），包含：

- 代码检查和测试
- 自动部署到 Vercel（main 分支）
- 数据库迁移（main 分支）

#### 必需的 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 描述 |
|-------------|------|
| `VERCEL_TOKEN` | Vercel API Token |
| `VERCEL_ORG_ID` | Vercel Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |
| `SUPABASE_ACCESS_TOKEN` | Supabase Access Token |
| `SUPABASE_PROJECT_REF` | Supabase Project Reference |

## 🐛 故障排除

### 常见问题

#### 1. 构建失败

**问题**：Vercel 构建时出现错误

**解决方案**：
- 检查 `package.json` 中的依赖是否正确
- 确认所有环境变量都已设置
- 查看构建日志中的具体错误信息

#### 2. 数据库连接失败

**问题**：应用无法连接到 Supabase

**解决方案**：
- 验证 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
- 检查 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否有效
- 确认 Supabase 项目是否处于活跃状态

#### 3. 认证问题

**问题**：用户无法登录或注册

**解决方案**：
- 检查 Supabase Auth 设置
- 确认重定向 URL 配置正确
- 验证邮箱模板设置

#### 4. RLS 策略问题

**问题**：用户无法访问数据

**解决方案**：
- 检查行级安全策略配置
- 确认用户权限设置正确
- 验证策略逻辑

### 调试技巧

#### 查看应用日志

1. **Vercel 日志**
   - 在 Vercel 控制台查看函数日志
   - 检查构建和运行时错误

2. **Supabase 日志**
   - 在 Supabase 控制台查看数据库查询日志
   - 检查认证相关日志

#### 本地调试

```bash
# 本地运行开发服务器
npm run dev

# 本地运行 Supabase
npm run supabase:start

# 运行测试
npm run test

# 类型检查
npm run type-check
```

## 📈 性能优化

### 建议的优化措施

1. **图片优化**
   - 使用 Next.js Image 组件
   - 配置图片域名

2. **缓存策略**
   - 配置适当的缓存头
   - 使用 ISR（增量静态再生）

3. **数据库优化**
   - 添加适当的索引
   - 优化查询性能

4. **SEO 优化**
   - 配置元数据
   - 生成 sitemap

## 🔄 持续部署

启用自动部署后，每次推送到 main 分支都会触发：

1. **代码质量检查**
   - ESLint 检查
   - TypeScript 类型检查
   - 单元测试

2. **构建和部署**
   - Next.js 应用构建
   - 部署到 Vercel

3. **数据库迁移**
   - 自动执行 Supabase 迁移

## 📞 支持

如果在部署过程中遇到问题：

1. 查看 [故障排除](#故障排除) 部分
2. 检查项目的 GitHub Issues
3. 参考 [Vercel 文档](https://vercel.com/docs)
4. 参考 [Supabase 文档](https://supabase.com/docs)

---

**恭喜！** 🎉 您的 boke 博客现在已经成功部署到 Vercel，可以开始分享您的想法和内容了！
