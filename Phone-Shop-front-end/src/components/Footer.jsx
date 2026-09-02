import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">PhoneStore</h2>
            <p className="text-sm text-gray-400">
              Your trusted place for the latest smartphones at the best prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition">All Phones</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
              <li><Link to="/my-account" className="hover:text-white transition">My Account</Link></li>
            </ul>
          </div>

          {/* Support */}

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@phone-store.asia</li>
              <li>Phone: +92 300 12345--</li>
              <li>Address: Islamabad, Pakistan</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PhoneStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer