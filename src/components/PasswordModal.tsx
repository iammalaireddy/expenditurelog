import { useState, type FormEvent } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PasswordModalProps {
  onUnlock: () => void
}

export function PasswordModal({ onUnlock }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'threefold2024'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    // Simulate a small delay for security feel
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (password === correctPassword) {
      onUnlock()
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <div className="password-icon">
            <Lock size={32} />
          </div>
          <h1>Access Required</h1>
          <p>Enter your password to access the household planner</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="password-form">
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoFocus
              disabled={loading}
              className="password-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="password-error">{error}</div>}

          <button type="submit" className="password-submit" disabled={loading || !password.trim()}>
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>

        <div className="password-footer">
          <p>This planner is password protected to keep your financial information secure.</p>
        </div>
      </div>
    </div>
  )
}
