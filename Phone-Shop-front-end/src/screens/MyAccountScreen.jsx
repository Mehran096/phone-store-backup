import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUserProfile } from '../slices/authSlice'
import { FaUser, FaSave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Loader from '../components/Loader'
import Message from '../components/Message'

const MyAccountScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo, loading: loadingUpdate, error: errorUpdate } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
    } else {
      setName(userInfo.name)
      setEmail(userInfo.email)
    }
  }, [navigate, userInfo])

  const submitHandler = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    try {
      const userData = { id: userInfo._id, name, email }
      if (password) userData.password = password
      await dispatch(updateUserProfile(userData)).unwrap()
      toast.success('Profile updated successfully')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err?.data?.message || err.message || 'Update failed')
      toast.error(err?.data?.message || err.message || 'Update failed')
    }
  }

  return (
    <div className='container mx-auto px-4 py-6 md:py-8'>
      {/* Center everything */}
      <div className='flex justify-center'>
        <div className='w-full max-w-2xl'>
          <h1 className='text-2xl md:text-3xl font-bold mb-6 text-center'>My Account</h1>
          
          <div className='bg-white p-4 md:p-6 rounded-lg shadow-md'>
            <h2 className='flex items-center justify-center gap-2 text-xl font-semibold mb-4'>
              <FaUser className='text-blue-600'/> Update Profile
            </h2>
            
            {message && <Message variant='danger'>{message}</Message>}
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
            
            <form onSubmit={submitHandler} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} className='w-full p-2 border-gray-300 rounded-lg focus:ring-2 border focus:ring-blue-500' required />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Email Address</label>
                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full p-2 border-gray-300 rounded-lg focus:ring-2 border focus:ring-blue-500' required />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>New Password</label>
                <input type='password' placeholder='Leave blank to keep current' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full border p-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Confirm Password</label>
                <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' />
              </div>
              <button type='submit' disabled={loadingUpdate} className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#111] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50'>
                {loadingUpdate ? <Loader /> : <><FaSave /> Update</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccountScreen