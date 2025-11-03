'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import YouTube from '@tiptap/extension-youtube'
import { useCallback } from 'react'

interface TiptapEditorProps {
  content: any
  onChange: (content: any) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder = 'Start writing your article...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold px-4 py-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      YouTube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'aspect-video rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
        placeholder,
      },
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addYouTubeVideo = useCallback(() => {
    const url = window.prompt('Enter YouTube URL:')
    if (url) {
      editor?.chain().focus().setYouTubeVideo({ src: url }).run()
    }
  }, [editor])

  const insertTable = useCallback(() => {
    editor?.chain().focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run()
  }, [editor])

  const deleteTable = useCallback(() => {
    editor?.chain().focus()
      .deleteTable()
      .run()
  }, [editor])

  const addHeaderRow = useCallback(() => {
    editor?.chain().focus()
      .addHeaderRow()
      .run()
  }, [editor])

  const deleteHeaderRow = useCallback(() => {
    editor?.chain().focus()
      .deleteHeaderRow()
      .run()
  }, [editor])

  const addHeaderColumn = useCallback(() => {
    editor?.chain().focus()
      .addHeaderColumn()
      .run()
  }, [editor])

  const deleteHeaderColumn = useCallback(() => {
    editor?.chain().focus()
      .deleteHeaderColumn()
      .run()
  }, [editor])

  const toggleColumnHighlight = useCallback(() => {
    editor?.chain().focus()
      .toggleColumnHighlight()
      .run()
  }, [editor])

  const toggleHeaderCell = useCallback(() => {
    editor?.chain().focus()
      .toggleHeaderCell()
      .run()
  }, [editor])

  if (!editor) {
    return <div className="p-4 border rounded-lg">Loading editor...</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        {/* Text alignment */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
            title="Align Left"
          >
            ≡
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
            title="Align Center"
          >
            ≡
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
            title="Align Right"
          >
            ≡
          </button>
        </div>

        {/* Media */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200"
            title="Add Image"
          >
            🖼️
          </button>
          <button
            onClick={addYouTubeVideo}
            className="p-2 rounded hover:bg-gray-200"
            title="Add YouTube Video"
          >
            📺
          </button>
        </div>

        {/* Table */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Table"
          >
            ⊞
          </button>
          <button
            onClick={deleteTable}
            className="p-2 rounded hover:bg-gray-200"
            title="Delete Table"
            disabled={!editor.isActive('table')}
          >
            ⊟
          </button>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="Blockquote"
          >
            "
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
            title="Code Block"
          >
            {'</>'}
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-gray-200"
            title="Horizontal Rule"
          >
            —
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}