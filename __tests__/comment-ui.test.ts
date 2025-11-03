import { describe, it, expect } from 'vitest'
import { generateAvatarSeed, generateAvatarSVG, getInitials } from '@/lib/avatars'
import { formatCommentTimestamp, validateCommentLength, validateNickname } from '@/lib/comment-utils'

describe('Avatar Generation', () => {
  it('should generate consistent seed for same nickname', () => {
    const nickname = 'TestUser'
    const seed1 = generateAvatarSeed(nickname)
    const seed2 = generateAvatarSeed(nickname)
    
    expect(seed1).toBe(seed2)
    expect(seed1).toHaveLength(16)
  })

  it('should generate different seeds for different nicknames', () => {
    const seed1 = generateAvatarSeed('User1')
    const seed2 = generateAvatarSeed('User2')
    
    expect(seed1).not.toBe(seed2)
  })

  it('should generate valid SVG', () => {
    const svg = generateAvatarSVG('TestUser', 40)
    
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('width="40"')
    expect(svg).toContain('height="40"')
  })

  it('should extract initials correctly', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('Jane')).toBe('JA')
    expect(getInitials('A')).toBe('A')
    expect(getInitials('')).toBe('?')
  })
})

describe('Comment Utilities', () => {
  it('should format timestamps correctly', () => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    expect(formatCommentTimestamp(oneMinuteAgo.toISOString())).toBe('1 minute ago')
    expect(formatCommentTimestamp(oneHourAgo.toISOString())).toBe('1 hour ago')
    expect(formatCommentTimestamp(oneDayAgo.toISOString())).toBe('1 day ago')
  })

  it('should validate comment length', () => {
    const validComment = 'This is a valid comment'
    const emptyComment = ''
    const longComment = 'a'.repeat(1001)
    
    expect(validateCommentLength(validComment)).toEqual({
      isValid: true,
      remaining: 1000 - validComment.length
    })
    
    expect(validateCommentLength(emptyComment)).toEqual({
      isValid: false,
      remaining: 1000,
      message: 'Comment cannot be empty'
    })
    
    expect(validateCommentLength(longComment)).toEqual({
      isValid: false,
      remaining: -1,
      message: 'Comment must be less than 1000 characters'
    })
  })

  it('should validate nickname', () => {
    expect(validateNickname('John')).toEqual({ isValid: true })
    expect(validateNickname('John Doe')).toEqual({ isValid: true })
    expect(validateNickname('John_Doe-123')).toEqual({ isValid: true })
    
    expect(validateNickname('')).toEqual({
      isValid: false,
      message: 'Nickname is required'
    })
    
    expect(validateNickname('J')).toEqual({
      isValid: false,
      message: 'Nickname must be at least 2 characters'
    })
    
    expect(validateNickname('a'.repeat(21))).toEqual({
      isValid: false,
      message: 'Nickname must be less than 20 characters'
    })
  })
})

describe('Comment Form Data', () => {
  it('should validate complete comment form', () => {
    const validData = {
      nickname: 'TestUser',
      content: 'This is a test comment',
      article_id: '123e4567-e89b-12d3-a456-426614174000'
    }
    
    const nicknameValidation = validateNickname(validData.nickname)
    const contentValidation = validateCommentLength(validData.content)
    
    expect(nicknameValidation.isValid).toBe(true)
    expect(contentValidation.isValid).toBe(true)
  })
})
