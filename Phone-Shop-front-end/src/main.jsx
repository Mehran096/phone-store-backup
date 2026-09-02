import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store.js'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import axios from 'axios'

axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
)