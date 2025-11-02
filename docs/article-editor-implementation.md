# Article Editor Implementation

This document describes the implementation of the admin article editor interface with Tiptap editor, Supabase media upload, and Zod validation.

## Features Implemented

### 1. Authentication & Middleware
- **Middleware protection**: `/middleware.ts` protects all admin routes using Supabase service role key
- **Admin authentication**: Service role key validation via `x-admin-service-role-key` header
- **Demo authentication**: Simple key input for development/demo purposes

### 2. Tiptap Editor Integration
- **Rich text editing**: Bold, italic, underline, headings, lists, blockquotes, code blocks
- **Media embedding**: Image and YouTube video insertion
- **Table support**: Create, edit tables with headers and cells
- **Text alignment**: Left, center, right alignment options
- **Link support**: Internal and external link insertion

### 3. Media Upload System
- **Supabase Storage integration**: Upload images and videos to Supabase buckets
- **Drag & drop interface**: User-friendly file upload panel
- **File validation**: Type and size validation (images: JPEG, PNG, GIF, WebP; videos: MP4, WebM, OGG; max 10MB)
- **Progress tracking**: Visual upload progress indicator
- **Public URL generation**: Automatic public URL creation for uploaded media

### 4. Form Management
- **Auto-slug generation**: Automatic slug creation from title
- **Manual slug override**: Option to customize slug
- **Tags & categories**: Multi-select for tags, single select for categories
- **Publish status**: Draft, published, archived states
- **Featured image**: URL input with upload option
- **Read time calculation**: Automatic calculation based on content length

### 5. Live Preview
- **Real-time preview**: Switch between edit and preview modes
- **Accurate rendering**: Preview matches final article appearance
- **Responsive design**: Mobile-friendly preview display

### 6. Validation & Sanitization
- **Zod schemas**: Comprehensive validation for all inputs
- **Shared schemas**: Reusable validation logic across components
- **Input sanitization**: Automatic trimming and cleaning of user input
- **Error handling**: Clear error messages for validation failures

## File Structure

```
app/
├── admin/
│   ├── page.tsx                    # Admin dashboard
│   ├── articles/
│   │   ├── page.tsx               # Articles list
│   │   ├── new/page.tsx           # Create new article
│   │   └── [id]/edit/page.tsx     # Edit existing article
│   └── api/
│       ├── articles/
│       │   ├── route.ts           # List/create articles
│       │   └── [id]/route.ts      # Get/update/delete article
│       ├── media/
│       │   └── upload/route.ts    # Media upload endpoint
│       └── setup-storage/route.ts # Storage bucket setup
├── api/
│   └── articles/                   # Public article API (existing)
└── components/
    └── editor/
        ├── ArticleEditor.tsx        # Main editor component
        ├── TiptapEditor.tsx         # Tiptap editor with toolbar
        ├── MediaUploadPanel.tsx     # File upload interface
        └── ArticlePreview.tsx       # Live preview component

lib/
├── editor-schemas.ts               # Editor-specific Zod schemas
├── media.ts                        # Media upload service
└── [existing files]                # Data layer and utilities

middleware.ts                        # Admin route protection
```

## API Routes

### Admin Routes (Protected)
- `GET/POST /api/admin/articles` - List/create articles
- `GET/PUT/DELETE /api/admin/articles/[id] - Manage specific article
- `POST /api/admin/media/upload` - Upload media files
- `POST /api/admin/setup-storage` - Setup Supabase storage buckets

### Authentication
All admin routes require `x-admin-service-role-key` header matching the `SUPABASE_SERVICE_ROLE_KEY` environment variable.

## Usage

### 1. Setup Environment
```bash
# Copy .env.example to .env.local and configure:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Setup Storage
Visit `/api/admin/setup-storage` to create the media bucket, or call the API directly:
```bash
curl -X POST http://localhost:3000/api/admin/setup-storage \
  -H "Content-Type: application/json" \
  -H "x-admin-service-role-key: YOUR_SERVICE_ROLE_KEY" \
  -d '{"bucket": "media"}'
```

### 3. Access Admin Panel
Navigate to `/admin` and enter the service role key when prompted.

### 4. Create/Edit Articles
- Use `/admin/articles/new` to create new articles
- Use `/admin/articles/[id]/edit` to edit existing articles
- Switch between edit and preview tabs to see live changes

## Security Considerations

### Current Implementation (Demo)
- Service role key stored in localStorage for demo purposes
- Simple client-side authentication

### Production Recommendations
- Implement proper authentication with Supabase Auth
- Use server-side session validation
- Consider role-based access control
- Add CSRF protection
- Implement rate limiting

## Database Schema

The editor works with the existing articles schema:
- `articles` table with Tiptap JSON content
- `article_tags` and `article_categories` for relationships
- Supabase Storage for media files

## Testing

To test the implementation:

1. Start the development server: `npm run dev`
2. Navigate to `/admin`
3. Enter your Supabase service role key
4. Create a new article using the rich editor
5. Upload media files using the upload panel
6. Preview the article in real-time
7. Save and verify the article is stored correctly

## Dependencies Added

```json
{
  "@tiptap/extension-image": "^2.1.13",
  "@tiptap/extension-table": "^2.1.13", 
  "@tiptap/extension-table-row": "^2.1.13",
  "@tiptap/extension-table-cell": "^2.1.13",
  "@tiptap/extension-table-header": "^2.1.13",
  "@tiptap/extension-text-align": "^2.1.13",
  "@tiptap/extension-color": "^2.1.13",
  "@tiptap/extension-text-style": "^2.1.13",
  "@tiptap/extension-underline": "^2.1.13",
  "@tiptap/extension-link": "^2.1.13",
  "@tiptap/extension-youtube": "^2.1.13",
  "@hocuspocus/provider": "^2.1.13",
  "@supabase/storage-js": "^2.5.5"
}
```

This implementation provides a complete admin article editor interface with all requested features and follows Next.js 14 best practices.