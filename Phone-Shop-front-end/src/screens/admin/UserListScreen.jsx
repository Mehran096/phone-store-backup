import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { listUsers, deleteUser } from '../../slices/authSlice'
import { FaTrash, FaEdit, FaUserShield, FaUser } from 'react-icons/fa'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import Paginate from '../../components/Paginate'
import { toast } from 'react-toastify'
import api from '../../utils/axios'
 
 
const UserListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('keyword') || '')

  const keyword = searchParams.get('keyword') || ''
  const pageNumber = Number(searchParams.get('pageNumber')) || 1

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { users, userInfo, loading, error, page, pages, successDelete } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers({ keyword, pageNumber }))
    } else {
      navigate('/login')
    }
  }, [dispatch, navigate, userInfo, keyword, pageNumber, successDelete])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
    }
  }

  const toggleAdminHandler = async (id, isAdmin) => {
    if (window.confirm(`Are you sure you want to ${isAdmin ? 'remove admin' : 'make admin'}?`)) {
      try {
        await api.put(`/users/${id}/toggleAdmin`, {}, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        })
        toast.success('Admin status updated')
        dispatch(listUsers({ keyword, pageNumber }))
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message)
      }
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setSearchParams({ keyword: search, pageNumber: 1 })
    } else {
      setSearchParams({ pageNumber: 1 })
    }
  }

  const onPageChange = (pageNum) => {
    if (keyword) {
      setSearchParams({ keyword, pageNumber: pageNum })
    } else {
      setSearchParams({ pageNumber: pageNum })
    }
  }

  return (
    <>
      <div className='flex justify-between items-center flex-wrap gap-4 m-4'>
        <h1 className='text-2xl font-bold'>Users</h1>

        <form onSubmit={submitHandler} className='flex gap-2 w-full lg:w-auto'>
          <div className='relative flex-1 lg:w-72'>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name or email...'
              className='w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            {search && (
              <button
                type='button'
                onClick={() => {
                  setSearch('')
                  setSearchParams({ pageNumber: 1 })
                }}
                className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none z-10 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100'
              >
                ×
              </button>
            )}
          </div>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap'
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <div className='overflow-x-auto bg-white rounded-lg shadow m-4'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    NAME
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    EMAIL
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    ADMIN
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {users.map((user) => (
                  <tr key={user._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm text-gray-900'>
                      {user._id.substring(0, 10)}...
                    </td>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                      {user.name}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </td>
                    <td className='px-6 py-4 text-sm'>
                      <button
                        onClick={() => toggleAdminHandler(user._id, user.isAdmin)}
                        className={`flex items-center gap-1 ${
                          user.isAdmin ? 'text-green-600' : 'text-gray-400'
                        } hover:opacity-75`}
                        title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      >
                        {user.isAdmin ? <FaUserShield /> : <FaUser />}
                        {user.isAdmin ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className='px-6 py-4 text-sm space-x-3'>
                      <Link
                        to={`/admin/user/${user._id}/edit`}
                        className='text-blue-600 hover:text-blue-800 inline-block'
                      >
                        <FaEdit />
                      </Link>
                      <button
                        disabled={user._id === userInfo._id}
                        onClick={() => deleteHandler(user._id)}
                        className='text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paginate
            pages={pages}
            page={page}
            isAdmin={true}
            onPageChange={onPageChange}
            keyword={keyword}
            pathname="/admin/userlist"
            searchParamName="keyword"
          />
        </>
      )}
    </>
  )
}

export default UserListScreen