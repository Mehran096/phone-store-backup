import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword } from '../slices/authSlice'
import { toast } from 'react-toastify'

function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')

  const dispatch = useDispatch()
  const { search } = useLocation()

  const { loading, error, success, message } = useSelector((state) => state.auth)

  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/login'

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    if (success) {
      toast.success(message || 'Reset link sent. Check your inbox')
    }
  }, [error, success, message])

  const submitHandler = (e) => {
    e.preventDefault()
    if (!email) {
      return toast.error('Please enter your email')
    }
    dispatch(forgotPassword(email))
  }

  return (
    <>
     <Helmet>
        <title>Forgot Password | Phone-Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

    <div className="bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries. Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200 sm:px-10">
            <form className="space-y-6" onSubmit={submitHandler}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-base sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Remember your password?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={redirect? `/login?redirect=${redirect}` : '/login'}
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-base sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</>
  )
}

export default ForgotPasswordScreen