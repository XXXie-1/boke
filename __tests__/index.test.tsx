import { render, screen } from '@testing-library/react'
import Home from '../pages/index'

describe('Home', () => {
  it('renders welcome message', () => {
    render(<Home user={null} />)
    expect(screen.getByText('Vercel + Supabase Starter')).toBeInTheDocument()
  })

  it('shows sign in and sign up buttons when user is not logged in', () => {
    render(<Home user={null} />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('shows welcome message and logout button when user is logged in', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      full_name: null,
      avatar_url: null,
      username: null,
      website: null
    }
    
    render(<Home user={mockUser} />)
    expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})