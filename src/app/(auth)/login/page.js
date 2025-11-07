'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2, LogIn, Chrome } from 'lucide-react'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // 🔹 Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/dashboard')
    } catch (err) {
      setError('Google login failed.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Forgot password
  const handleForgotPassword = async () => {
   router.push('/reset-password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6" /> Login
          </CardTitle>
          <CardDescription>
            Sign in to your account to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
            {resetEmailSent && (
              <p className="text-green-600 text-sm mt-2">
                Password reset email sent! Check your inbox.
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="flex justify-between mt-4 text-sm">
            <button
              onClick={handleForgotPassword}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Forgot password?
            </button>

            <Link href="/signup" className="text-blue-600 hover:underline">
              Don’t have an account? Register
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center my-5">
            <hr className="grow border-gray-300" />
            <span className="px-2 text-gray-400 text-sm">or</span>
            <hr className="grow border-gray-300" />
          </div>

          {/* Google Sign-in */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
