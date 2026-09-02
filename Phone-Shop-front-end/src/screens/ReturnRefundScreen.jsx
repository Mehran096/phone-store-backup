import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async';

const ReturnRefundScreen = () => {
  return (
    <>
     {/* SEO start */}
      <Helmet>
        <title>Return & Refund Policy | 7-Day Returns | Phone-Store Pakistan</title>
        <meta 
          name="description" 
          content="Phone-Store Pakistan returns policy: 7-day returns, unused sealed phones only. Refunds processed in 5-7 days via Easypaisa, JazzCash or bank transfer." 
        />
        <link rel="canonical" href="https://www.phone-store.asia/return-refund" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="Return & Refund Policy | Phone-Store Pakistan" />
        <meta property="og:url" content="https://www.phone-store.asia/return-refund" />
        <meta property="og:type" content="website" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Return and Refund Policy",
            "url": "https://www.phone-store.asia/return-refund",
            "description": "7-day return policy and refund process for Phone-Store Pakistan"
          })}
        </script>
      </Helmet>
      {/* SEO end */}
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <Link to='/' className='text-blue-500 hover:underline mb-4 inline-block'>← Go Back</Link>
      
      <h1 className='text-2xl sm:text-3xl font-bold mb-2'>Returns & Refunds Policy</h1>
      <p className='text-gray-400 mb-8'>Last updated: Oct 4, 2026</p>

      <div className='space-y-6 text-gray-600'>
        
        <section>
          <h2 className='text-xl font-semibold text-white mb-2'>1. Return Policy</h2>
          <p>
            We offer a 7-day return policy for all products. If you’re not satisfied with your purchase, 
            you can return it within 7 days of delivery for a full refund or exchange.
          </p>
          <ul className='list-disc list-inside mt-2 space-y-1'>
            <li>Product must be unused, in original packaging, and with all accessories.</li>
            <li>Proof of purchase is required.</li>
            <li>Opened SIM slots or physical damage will void the return.</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-white mb-2'>2. Refund Process</h2>
          <p>
            Once we receive and inspect your returned item, we’ll notify you about the refund approval. 
            Approved refunds will be processed within 5-7 business days to your original payment method.
          </p>
          <p className='mt-2'>
            For Cash on Delivery orders, refunds will be issued via bank transfer or Easypaisa/JazzCash.
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-white mb-2'>3. Non-Returnable Items</h2>
          <ul className='list-disc list-inside space-y-1'>
            <li>Products damaged due to misuse or accidents</li>
            <li>Items without original packaging and accessories</li>
            <li>Products returned after 7 days from delivery date</li>
            <li>Software, digital downloads, and gift cards</li>
          </ul>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-white mb-2'>4. Warranty Claims</h2>
          <p>
            All phones come with a 1-year manufacturer warranty. For warranty claims, contact us with 
            your order number and issue description. We’ll arrange pickup and repair/replacement as per 
            the manufacturer’s policy.
          </p>
        </section>

        <section>
          <h2 className='text-xl font-semibold text-white mb-2'>5. How to Request a Return</h2>
          <ol className='list-decimal list-inside space-y-1'>
            <li>Go to My Account &gt; Orders and select “Request Return”</li>
            <li>Fill out the return form with reason and photos if needed</li>
            <li>Wait for approval. We’ll send you a pickup label</li>
            <li>Pack the item securely and hand it to our rider</li>
          </ol>
        </section>

        <div className='bg-gray-800 p-4 rounded-lg mt-8'>
          <p className='font-medium text-white mb-2'>Need help with a return?</p>
          <p>
            Contact our support team at <span className='text-blue-400'>support@phone-store.asia </span> 
            or call <span className='text-blue-400'>+92 300 12345--</span>. We’re available 9 AM - 6 PM, Mon-Sat.
          </p>
        </div>

      </div>
    </div>

</>
  )
}

export default ReturnRefundScreen