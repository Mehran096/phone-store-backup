import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ShippingPolicyScreen = () => {
  return (
    <>
      {/* SEO start */}
      <Helmet>
        <title>Shipping Policy Pakistan | 3-5 Day Delivery | Phone-Store</title>
        <meta 
          name="description" 
          content="Phone-Store Pakistan shipping policy. Standard 3-5 business days, Express 1-2 days. Cash on Delivery available. Track iPhone & Pixel orders in Peshawar." 
        />
        <link rel="canonical" href="https://www.phone-store.asia/shipping-policy" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="Shipping Policy | Phone-Store Pakistan" />
        <meta property="og:url" content="https://www.phone-store.asia/shipping-policy" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Shipping Policy",
            "url": "https://www.phone-store.asia/shipping-policy",
            "description": "Shipping times, COD, and delivery policy for Phone-Store Pakistan"
          })}
        </script>
      </Helmet>
      {/* SEO end */}

      <div className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Shipping Policy</h1>
        
        <div className='space-y-4 text-gray-700'>
          <p><strong>Standard Shipping:</strong> 3-5 business days across Pakistan.</p>
          <p><strong>Express Shipping:</strong> 1-2 business days within major cities including Peshawar.</p>
          <p><strong>Cash on Delivery:</strong> Available for all orders across Pakistan.</p>
          <p><strong>Tracking:</strong> You’ll get a tracking number via email/SMS once shipped.</p>
          <p><strong>Original Phones:</strong> 100% original and sealed. Sourced from authorized distributors.</p>
          <p>Questions? <Link to="/contact" className='text-blue-600 underline'>Contact Support</Link></p>
        </div>
      </div>
    </>
  )
}

export default ShippingPolicyScreen;