import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
 
import api from '../utils/axios'


//const  API = 'api'

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true // <- Add this for cookies
      }
      const { data } = await api.post(
        `/users/auth`,
        { email, password },
        config
      )
      // localStorage.setItem removed - handle in .fulfilled
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true // <- Add this for cookies
      }
      const { data } = await api.post(
        `/users`,
        { name, email, password },
        config
      )
      // localStorage.setItem removed - handle in .fulfilled
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

//google authentication 
export const loginGoogle = createAsyncThunk(
  'auth/loginGoogle',
  async ({ name, email, googleId, photo }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
      const { data } = await api.post(
        '/users/google',
        { name, email, googleId, photo },
        config
      )
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/forgotpassword', { email })
      return data.message
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/resetpassword/${token}`, { password })
      return data.message
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)



export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (user, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true // <- Cookie handles auth now
      }
      const { data } = await api.put(`/users/profile`, user, config)
      // localStorage.setItem removed - handle in .fulfilled
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)
 
export const listUsers = createAsyncThunk(
  'user/listUsers',
  async ({ keyword = '', pageNumber = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users', {
        params: { keyword, pageNumber },
        withCredentials: true  // <-- This sends the cookie
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// DELETE USER - Admin only
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState()



      await api.delete(`/users/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      )
    }
  }
)

// 1. Define the thunks FIRST
export const getUserDetails = createAsyncThunk(
  'auth/getUserDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo }
      } = getState()


      const { data } = await api.get(`/users/${id}`)
      return data


    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }

  })
//update user
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ id, name, email, isAdmin }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState()

      const { data } = await api.put(`/users/${id}`, { name, email, isAdmin })
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)
//createSlice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: userInfoFromStorage,
    users: [],
    loading: false,
    error: null,
    successDelete: false,
    success: false,
    userDetails: null,
    successUpdate: false,
     message: null,
    page: 1,
    pages: 1,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
    },
    logout: (state) => {
      localStorage.removeItem('userInfo')
      localStorage.removeItem('cart')
      state.userInfo = null
      state.loading = false
      state.error = null
      state.success = false
      state.message = null
    },
    resetUpdate: (state) => {
      state.success = false
      state.error = null
    },
    resetUserList: (state) => {
      state.users = []
      state.error = null
    },
    resetUserUpdate: (state) => {
      state.successUpdate = false
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getUserDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false
        state.userDetails = action.payload
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.successUpdate = true
      })
      .addCase(listUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.page = action.payload.page
        state.pages = action.payload.pages
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // DELETE USER
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.successDelete = true
        state.users = state.users.filter((user) => user._id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(login.pending, (state) => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload
        localStorage.setItem('userInfo', JSON.stringify(action.payload)) // <- Add this
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(register.pending, (state) => { state.loading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload
        localStorage.setItem('userInfo', JSON.stringify(action.payload)) // <- Add this
      })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      //google authentication
      .addCase(loginGoogle.pending, (state) => {
  state.loading = true
  state.error = null
})
.addCase(loginGoogle.fulfilled, (state, action) => {
  state.loading = false
  state.userInfo = action.payload
  localStorage.setItem('userInfo', JSON.stringify(action.payload))
})
.addCase(loginGoogle.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload
})

      .addCase(updateUserProfile.pending, (state) => { state.loading = true; state.success = false })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.userInfo = action.payload
        state.success = true
        localStorage.setItem('userInfo', JSON.stringify(action.payload)) // <- Add this
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(forgotPassword.pending, (state) => {
  state.loading = true
  state.error = null
  state.success = false
})
.addCase(forgotPassword.fulfilled, (state, action) => {
  state.loading = false
  state.success = true
  state.message = action.payload
})
.addCase(forgotPassword.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload
  state.success = false
})
.addCase(resetPassword.pending, (state) => {
  state.loading = true
  state.error = null
})
.addCase(resetPassword.fulfilled, (state, action) => {
  state.loading = false
  state.success = true
  state.message = action.payload
})
.addCase(resetPassword.rejected, (state, action) => {
  state.loading = false
  state.error = action.payload
})

  },
})

export const { setCredentials, logout, resetUpdate, resetUserUpdate } = authSlice.actions
export default authSlice.reducer