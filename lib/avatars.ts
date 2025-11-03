import CryptoJS from 'crypto-js'

// Generate a deterministic avatar seed from a nickname
export function generateAvatarSeed(nickname: string): string {
  // Create a hash from the nickname
  const hash = CryptoJS.SHA256(nickname.toLowerCase().trim()).toString()
  // Take first 16 characters for a reasonable seed length
  return hash.substring(0, 16)
}

// Generate avatar SVG using a simple geometric pattern based on seed
export function generateAvatarSVG(nickname: string, size: number = 40): string {
  const seed = generateAvatarSeed(nickname)
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ]
  
  // Use seed to deterministically select colors and patterns
  const colorIndex = parseInt(seed.substring(0, 8), 16) % colors.length
  const patternType = parseInt(seed.substring(8, 10), 16) % 3
  const rotation = parseInt(seed.substring(10, 12), 16) % 360
  
  const backgroundColor = colors[colorIndex]
  const patternColor = colors[(colorIndex + 1) % colors.length]
  
  let pattern = ''
  
  switch (patternType) {
    case 0: // Circles pattern
      pattern = `
        <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.15}" fill="${patternColor}" opacity="0.7"/>
        <circle cx="${size * 0.7}" cy="${size * 0.3}" r="${size * 0.15}" fill="${patternColor}" opacity="0.7"/>
        <circle cx="${size * 0.5}" cy="${size * 0.7}" r="${size * 0.2}" fill="${patternColor}" opacity="0.7"/>
      `
      break
    case 1: // Squares pattern
      pattern = `
        <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.25}" height="${size * 0.25}" fill="${patternColor}" opacity="0.7"/>
        <rect x="${size * 0.55}" y="${size * 0.2}" width="${size * 0.25}" height="${size * 0.25}" fill="${patternColor}" opacity="0.7"/>
        <rect x="${size * 0.375}" y="${size * 0.55}" width="${size * 0.25}" height="${size * 0.25}" fill="${patternColor}" opacity="0.7"/>
      `
      break
    case 2: // Triangle pattern
      pattern = `
        <polygon points="${size * 0.5},${size * 0.2} ${size * 0.8},${size * 0.7} ${size * 0.2},${size * 0.7}" fill="${patternColor}" opacity="0.7"/>
      `
      break
  }
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      <g transform="rotate(${rotation} ${size/2} ${size/2})">
        ${pattern}
      </g>
    </svg>
  `.trim()
}

// Get initials from nickname for fallback
export function getInitials(nickname: string): string {
  const cleaned = nickname.trim()
  if (cleaned.length === 0) return '?'
  
  const parts = cleaned.split(' ')
  if (parts.length >= 2) {
    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
  }
  
  return cleaned.substring(0, Math.min(2, cleaned.length)).toUpperCase()
}
