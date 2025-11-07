-- Insert sample blog posts
-- Note: This migration assumes a user exists. In production, you'd want to handle this differently

-- Insert sample posts (using a placeholder user ID - replace with actual user ID in production)
INSERT INTO public.posts (title, slug, content, excerpt, author_id, published, published_at) VALUES
(
  '欢迎来到我的博客',
  'welcome-to-my-blog',
  '欢迎来到我的个人博客！这是一个使用 Next.js 和 Supabase 构建的现代化博客平台。

在这里，我将分享我的技术学习心得、项目经验以及对生活的思考。希望通过这个平台，能够与更多的朋友交流和学习。

## 关于这个博客

这个博客项目采用了以下技术栈：

- **Next.js 14**: 现代化的 React 框架
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Supabase**: 开源的 Firebase 替代方案

## 未来计划

我计划在博客中分享以下内容：

1. **技术教程**: 前端开发、后端开发、数据库设计等
2. **项目实战**: 从零到一构建完整的项目
3. **学习笔记**: 日常学习中的重要知识点总结
4. **生活感悟**: 对工作、生活的一些思考

感谢您的访问，希望您能在这里找到有价值的内容！',
  '这是我的第一篇博客文章，向大家介绍这个博客平台的建立初衷和技术选型。',
  '00000000-0000-0000-0000-000000000000',
  true,
  NOW()
),
(
  'Next.js 14 新特性介绍',
  'nextjs-14-new-features',
  'Next.js 14 带来了许多令人兴奋的新特性和改进。在这篇文章中，我将为大家详细介绍这些变化。

## 主要更新内容

### 1. Turbopack 稳定版

Next.js 14 中，Turbopack 终于迎来了稳定版。Turbopack 是 Rust 构建的下一代打包工具，能够显著提升开发体验：

- **本地开发速度提升 53%**
- **快速刷新速度提升 94%**
- **更好的内存使用效率'

### 2. Server Actions 增强

Server Actions 在 Next.js 14 中得到了进一步增强：

```javascript
// 服务器组件中的表单处理
async function createPost(formData) {
  'use server'
  
  const title = formData.get('title')
  const content = formData.get('content')
  
  // 处理表单数据
  await savePost({ title, content })
}
```

### 3. 元数据 API 改进

新的元数据 API 让 SEO 优化变得更加简单：

```javascript
export const metadata = {
  title: 'My Blog Post',
  description: 'An amazing blog post about Next.js',
  openGraph: {
    title: 'My Blog Post',
    description: 'An amazing blog post about Next.js',
    images: ['/og-image.jpg'],
  },
}
```

## 性能优化

Next.js 14 在性能方面也有显著提升：

- 更小的包体积
- 更快的页面加载速度
- 改进的缓存策略

## 总结

Next.js 14 是一个重要的版本更新，带来了许多实用的改进。建议开发者尽快升级到最新版本，以享受这些新特性带来的好处。',
  '详细介绍 Next.js 14 的新特性，包括 Turbopack、Server Actions 和元数据 API 的改进。',
  '00000000-0000-0000-0000-000000000000',
  true,
  NOW()
),
(
  'Supabase 入门指南',
  'supabase-getting-started-guide',
  'Supabase 是一个开源的 Firebase 替代方案，为开发者提供了完整的后端服务。本文将带你快速入门 Supabase。

## 什么是 Supabase？

Supabase 提供了以下核心功能：

- **数据库**: PostgreSQL 数据库
- **认证**: 用户认证和授权
- **存储**: 文件存储服务
- **实时**: 实时数据同步
- **边缘函数**: 无服务器函数

## 快速开始

### 1. 创建项目

访问 [supabase.com](https://supabase.com) 并创建一个新项目。

### 2. 安装客户端库

```bash
npm install @supabase/supabase-js
```

### 3. 初始化客户端

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

## 数据库操作

### 查询数据

```javascript
// 获取所有数据
const { data, error } = await supabase
  .from('posts')
  .select('*')

// 带条件查询
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
```

### 插入数据

```javascript
const { data, error } = await supabase
  .from('posts')
  .insert([
    { title: 'Hello World', content: 'My first post' }
  ])
```

## 用户认证

Supabase 提供了完整的认证解决方案：

```javascript
// 注册用户
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 登录用户
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

## 实时功能

Supabase 的实时功能让数据同步变得简单：

```javascript
// 监听数据变化
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => console.log('New post!', payload)
  )
  .subscribe()
```

## 总结

Supabase 是一个强大的后端即服务平台，特别适合快速原型开发和中小型项目。它与 Next.js 的结合让全栈开发变得前所未有的简单。',
  'Supabase 是 Firebase 的开源替代方案，本文介绍如何快速上手使用 Supabase 构建后端服务。',
  '00000000-0000-0000-0000-000000000000',
  true,
  NOW()
);
