import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days within Pakistan.'
  },
  {
    q: 'Do you offer warranty?',
    a: 'Yes, all phones come with a 1-year manufacturer warranty and 7-day return policy for defective items.'
  },
  {
    q: 'Can I pay cash on delivery?',
    a: 'Yes, we offer Cash on Delivery for all orders across Pakistan.'
  },
  {
    q: 'Are the phones original?',
    a: '100% original and sealed. We source directly from authorized distributors.'
  },
  {
    q: 'How do I track my order?',
    a: 'Once shipped, you’ll get a tracking number via email/SMS. You can also check it in My Account > Orders.'
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can cancel within 2 hours of placing the order if it hasn’t been shipped yet. Contact support for help.'
  }
]

const FAQScreen = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [search, setSearch] = useState('')

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(search.toLowerCase()) || 
    faq.a.toLowerCase().includes(search.toLowerCase())
  )

 const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
  
  return (
    <>
     {/* SEO start */}
      <Helmet>
        <title>FAQ | Phone-Store Pakistan | Shipping, Warranty, COD</title>
        <meta 
          name="description" 
          content="FAQs for Phone-Store Pakistan. Shipping 3-5 days, 1-year warranty, 7-day returns, Cash on Delivery, 100% original phones. Peshawar support." 
        />
        <link rel="canonical" href="https://www.phone-store.asia/faq" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="FAQ | Phone-Store Pakistan" />
        <meta property="og:url" content="https://www.phone-store.asia/faq" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      {/* SEO end */}
    <div className='max-w-3xl mx-auto px-4 py-6'>
      <Link to='/' className='text-blue-500 hover:underline mb-4 inline-block'>← Go Back</Link>
      
      <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Frequently Asked Questions</h1>
      <p className='text-gray-400 mb-6'>Find answers to common questions about PhoneStore.</p>

      {/* Search Bar */}
      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search FAQs...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full px-4 py-3 rounded-lg border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* FAQ List */}
      <div className='space-y-3'>
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const originalIndex = faqs.findIndex(f => f.q === faq.q)
            return (
              <div key={originalIndex} className='border border-gray-700 rounded-lg overflow-hidden'>
                <button
                  onClick={() => toggle(originalIndex)}
                  className='w-full text-left px-5 py-5 flex justify-between items-center hover:bg-gray-800 transition'
                >
                  <span className='font-medium pr-4'>{faq.q}</span>
                  <span className='text-xl flex-shrink-0'>{openIndex === originalIndex ? '−' : '+'}</span>
                </button>
                
                {openIndex === originalIndex && (
                  <div className='px-5 pb-5 text-gray-300'>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className='text-center py-8 text-gray-400'>
            No results found for "{search}"
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className='mt-10 text-center'>
        <p className='text-gray-400'>Still have questions?</p>
        <Link to='/contact' className='text-blue-500 hover:underline font-medium'>
          Contact Us
        </Link>
      </div>
    </div>
</>
  )
}

export default FAQScreen