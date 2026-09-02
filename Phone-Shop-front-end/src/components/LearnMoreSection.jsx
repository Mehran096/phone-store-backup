import { useNavigate } from 'react-router-dom'

export default function LearnMoreSection() {
  const navigate = useNavigate()

  return (
    <section className='bg-black py-16 md:py-24'>
      <div className='container mx-auto px-4 text-center'>
        
        {/* Top text - exactly like your screenshot */}
        <h2 className='text-xl md:text-3xl font-medium text-gray-200 mb-8 tracking-wide'>
          Snapdragon® 8 Elite | Ultra-Slim Design | 6000 mAh Battery
        </h2>
        
        {/* Learn more button - pill shape */}
        <button 
          onClick={() => navigate('/product/flagship-phone')}
          className='bg-white text-black px-10 py-3 rounded-full text-base font-medium hover:bg-gray-200 hover:scale-105 transition-all duration-300 mb-12'
        >
          Learn more
        </button>
        
        {/* Phone lineup - use your single fanned image for now */}
        <div className='flex justify-center'>
          <img 
            src='/assets/phones/fanned-phones.png' 
            alt='Phone colors' 
            className='w-full max-w-2xl md:max-w-4xl object-contain hover:scale-105 transition-transform duration-500' 
          />
        </div>
        
      </div>
    </section>
  )
}