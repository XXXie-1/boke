// Utility functions and helpers
export const cn = (...inputs: unknown[]): string => {
  return inputs.filter(Boolean).join(' ')
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Export articles data layer
export * from './supabase'
export * from './schemas'
export * from './articles'
export * from './actions'
export * from './utils'
export * from './metadata'
