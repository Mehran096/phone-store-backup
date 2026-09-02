import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Helmet } from 'react-helmet-async';
 
import api from '../utils/axios'


const ContactScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

 const submitHandler = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    await api.post('/contact', formData)
    toast.success('Message sent! We’ll get back to you within 24 hours.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  } catch (error) {
    toast.error(error.response?.data?.message || error.message)
  }
  setLoading(false)
}

  return (
    <>
    {/* SEO start */}
      <Helmet>
        <title>Contact Phone-Store Peshawar | COD & Support</title>
        <meta 
          name="description" 
          content="Contact Phone-Store in Peshawar, Pakistan. Questions about iPhone, Pixel, COD delivery, warranty or returns? Message us, we reply within 24 hours." 
        />
        <link rel="canonical" href="https://www.phone-store.asia/contact" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="Contact Phone-Store Peshawar | COD & Support" />
        <meta property="og:description" content="Contact Phone-Store Pakistan for iPhone, Pixel phones, COD, warranty & delivery support." />
        <meta property="og:url" content="https://www.phone-store.asia/contact" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "url": "https://www.phone-store.asia/contact",
            "name": "Contact Phone-Store",
            "about": "Customer support for phone purchases in Pakistan"
          })}
        </script>
      </Helmet>
      {/* SEO end */}
      
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <Link to='/' className='text-blue-500 hover:underline mb-4 inline-block'>← Go Back</Link>
      
      <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Contact Us</h1>
      <p className='text-gray-400 mb-8'>Have a question? Send us a message and we’ll respond ASAP.</p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        
        {/* Contact Info */}
        <div className='md:col-span-1 space-y-6'>
          <div className='bg-gray-800 p-5 rounded-lg'>
            <h3 className='text-lg font-semibold mb-3'>Get in Touch</h3>
            <div className='space-y-3 text-gray-300'>
              <p><span className='font-medium text-white'>Email:</span><br />support@phone-store.asia</p>
              <p><span className='font-medium text-white'>Phone:</span><br />+92 300 12345--</p>
              <p><span className='font-medium text-white'>Address:</span><br />Islamabad, Pakistan</p>
              <p><span className='font-medium text-white'>Hours:</span><br />Mon - Sat, 9 AM - 6 PM</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className='md:col-span-2'>
          <form onSubmit={submitHandler} className='space-y-4'>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 rounded-lg border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Your name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-3 rounded-lg border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='your@email.com'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Subject</label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 rounded-lg border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='What is this about?'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Message</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                required
                rows='5'
                className='w-full px-4 py-3 rounded-lg border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                placeholder='Write your message here...'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 rounded-lg transition'
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </>
  )
}

export default ContactScreen