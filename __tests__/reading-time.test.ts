import { describe, it, expect } from 'vitest'
import { calculateReadTimeFromTiptapJSON } from '@/lib/utils'

describe('Reading Time Calculation', () => {
  it('should calculate reading time for simple text', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'This is a simple paragraph with some words. It has more than twenty words to test the reading time calculation properly.'
            }
          ]
        }
      ]
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1) // Should be at least 1 minute
  })

  it('should calculate reading time for longer content', () => {
    const words = 'word '.repeat(400).trim() // 400 words
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: words
            }
          ]
        }
      ]
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(2) // 400 words / 200 = 2 minutes
  })

  it('should handle nested content structure', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          content: [
            {
              type: 'text',
              text: 'Heading Title'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First paragraph with some text.'
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second paragraph with more text content.'
            }
          ]
        }
      ]
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1)
  })

  it('should handle empty content', () => {
    const content = {
      type: 'doc',
      content: []
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1) // Minimum 1 minute
  })

  it('should handle invalid content gracefully', () => {
    const content = null
    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1) // Minimum 1 minute
  })

  it('should handle content with multiple text nodes', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First part of text. '
            },
            {
              type: 'text',
              text: 'Second part of text. '
            },
            {
              type: 'text',
              text: 'Third part of text.'
            }
          ]
        }
      ]
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1)
  })

  it('should handle content with formatting nodes', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Normal text. '
            },
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Bold text. '
            },
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: 'Italic text.'
            }
          ]
        }
      ]
    }

    const readTime = calculateReadTimeFromTiptapJSON(content)
    expect(readTime).toBe(1)
  })
})