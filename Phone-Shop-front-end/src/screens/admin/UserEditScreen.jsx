import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserDetails, updateUser } from '../../slices/authSlice'

const UserEditScreen = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const { userDetails, loading, error, successUpdate } = useSelector((state) => state.auth)

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: 'auth/resetUserUpdate' })
      navigate('/admin/userlist')
    } else {
      if (!userDetails || userDetails._id !== id) {
        dispatch(getUserDetails(id))
      } else {
        setName(userDetails.name)
        setEmail(userDetails.email)
        setIsAdmin(userDetails.isAdmin)
      }
    }
  }, [userDetails, id, dispatch, navigate, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ id, name, email, isAdmin }))
  }

  const inputClass = "mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
const labelClass = "block text-sm font-medium text-gray-700"

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/admin/userlist" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Go Back
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Edit User</h1>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Is Admin</label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700"
            >
              Update
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default UserEditScreen