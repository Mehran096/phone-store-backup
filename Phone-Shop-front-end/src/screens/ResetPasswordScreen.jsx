import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '../slices/authSlice'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { loading, error, success, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    if (success) {
      toast.success(message || 'Password reset successful')
      setTimeout(() => navigate('/login'), 2000)
    }
  }, [error, success, message, navigate])

  const submitHandler = (e) => {
    e.preventDefault()
    
    if (!password ||!confirmPassword) {
      return toast.error('Please fill all fields')
    }
    if (password!== confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    dispatch(resetPassword({ token, password }))
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
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200 sm:px-10">
            <form className="space-y-6" onSubmit={submitHandler}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm new password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm pr-10"
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-base sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Changed your mind?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
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

export default ResetPasswordScreen