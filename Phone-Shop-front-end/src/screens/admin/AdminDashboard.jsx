import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { FaBox, FaUsers, FaShoppingCart, FaChartLine, FaPlus } from 'react-icons/fa'
import api from '../../utils/axios';
 
const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const { userInfo } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      })
      setStats(data)
    }
    fetchStats()
  }, [userInfo])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Sales" value={`$${stats.totalSales || 0}`} icon={<FaChartLine />} />
        <StatCard title="Products" value={stats.productCount || 0} icon={<FaBox />} />
        <StatCard title="Orders" value={stats.orderCount || 0} icon={<FaShoppingCart />} />
        <StatCard title="Users" value={stats.userCount || 0} icon={<FaUsers />} />
      </div>

      {/* Quick Actions - Links to your existing screens */}
      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard 
          to="/admin/productlist" 
          title="Manage Products" 
          desc="View, edit, delete all products"
          icon={<FaBox />}
        />
        <ActionCard 
          to="/admin/product/create" 
          title="Add New Product" 
          desc="Create a new phone listing"
          icon={<FaPlus />}
        />
        <ActionCard 
          to="/admin/orderlist" 
          title="View Orders" 
          desc="Process & update order status"
          icon={<FaShoppingCart />}
        />
        <ActionCard 
          to="/admin/userlist" 
          title="Manage Users" 
          desc="View users & manage admins"
          icon={<FaUsers />}
        />
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
    <div className="text-3xl text-gray-600">{icon}</div>
  </div>
)

const ActionCard = ({ to, title, desc, icon }) => (
  <Link to={to} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition block">
    <div className="text-3xl mb-3 text-white">{icon}</div>
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </Link>
)

export default AdminDashboard