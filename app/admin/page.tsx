'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ModerationDashboard } from '@/components/admin/ModerationDashboard'

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if user is already authenticated (via localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('admin-token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Test the token by making a request to the admin API
      const response = await fetch('/api/admin/comments?token=' + encodeURIComponent(token))
      
      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('admin-token', token)
      } else {
        throw new Error('Invalid admin token')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setToken('')
    localStorage.removeItem('admin-token')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium mb-2">
                      Admin Token
                    </label>
                    <input
                      id="token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter your admin token"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading || !token.trim()}
                    className="w-full"
                  >
                    {loading ? 'Authenticating...' : 'Login'}
                  </Button>
                </form>
                
                <div className="mt-6 text-sm text-muted-foreground">
                  <p className="mb-2">Admin access is restricted to authorized personnel.</p>
                  <p>You need a valid admin token to access this dashboard.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
        
        <ModerationDashboard adminToken={token} />
      </div>
    </div>
  )
}

export default AdminDashboard
