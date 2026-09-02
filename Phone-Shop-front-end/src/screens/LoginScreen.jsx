import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, loginGoogle } from '../slices/authSlice'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { search } = useLocation()

  const { userInfo, loading, error } = useSelector((state) => state.auth)

  const sp = new URLSearchParams(search)
  const redirect = sp.get('redirect') || '/'

  useEffect(() => {
    if (userInfo) {
      navigate(redirect)
    }
  }, [navigate, userInfo, redirect])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const submitHandler = (e) => {
    e.preventDefault()
    if (!email ||!password) {
      return toast.error('Please fill all fields')
    }
    dispatch(login({ email, password }))
  }

  //google authentication
const signInWithGoogleHandler = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    
    // FIX: Destructure primitives only, don't assign result.user to a var
    const { displayName, email, uid, photoURL } = result.user
    
    await dispatch(loginGoogle({
      name: displayName,
      email: email,
      googleId: uid,
      photo: photoURL
    })).unwrap()
    
    toast.success('Signed in with Google')
  } catch (error) {
    // FIX: Don't toast the raw error object - it has circular refs
    console.error(error)
    toast.error(error.message || error.code || 'Google sign in failed')
  }
}

  return (
    <>
    {/* seo start */}
       <Helmet>
            <title>Login | Phone-Store</title>
            <meta name="robots" content="noindex, nofollow" />
        </Helmet>
    {/* seo end*/}

    <div className="bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Sign in to <span className="text-blue-600">PhoneStore</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your Phone, Our Passion
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm pr-10"
                    placeholder="••••••••"
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

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <Link
                    to={redirect? `/forgot-password?redirect=${redirect}` : '/forgot-password'}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-base sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
            {/* OR Divider */}
<div className='relative my-6'>
  <div className='absolute inset-0 flex items-center'>
    <div className='w-full border-t border-gray-300' />
  </div>
  <div className='relative flex justify-center text-sm'>
    <span className='px-2 bg-white text-gray-500'>OR</span>
  </div>
</div>

{/* Google Button */}
<button
  type='button'
  onClick={signInWithGoogleHandler}
  disabled={loading}
  className='w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg border border-gray-300 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
>
  <FcGoogle className='w-5 h-5' />
  {loading ? 'Signing in...' : 'Continue with Google'}
</button>
              {/* New to PhoneStore? Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">New to PhoneStore?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to={redirect? `/register?redirect=${redirect}` : '/register'}
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-base sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Create an account
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

export default LoginScreen