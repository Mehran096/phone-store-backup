import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const slides = [
  {
    id: 1,
    brand: 'Apple',
    title: 'iPhone 17 Pro Max',
    features: ['A19 Pro Chip', 'Titanium Design', '48MP Fusion Camera'],
    desktopImg: '/assets/apple.png',
    mobileImg: '/assets/apples.png',  
    link: '/products?brand=Apple',
  },
  {
    id: 2,
    brand: 'Samsung',
    title: 'Galaxy S26 Ultra',
    features: ['Snapdragon 8 Gen 4', '200MP Camera', 'AI Powered'],
    desktopImg: '/assets/samsung.png',  
    mobileImg: '/assets/samsungs.png',
    link: '/products?brand=Samsung',
  },
  {
    id: 3,
    brand: 'Google',
    title: 'Pixel 9 Pro',
    features: ['Tensor G4 Chip', 'Best AI Photos', '7 Years Updates'],
    desktopImg: '/assets/google.png', 
    mobileImg: '/assets/google.png',
    link: '/products?brand=Google',
  }
]

const HeroBanner = () => {
  const [current, setCurrent] = useState(0)

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1? 0 : prev + 1))
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">

      {/* Desktop Banner */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-20">
          <div className="flex items-center justify-between max-w-6xl mx-auto">

            {/* Left: Text */}
            <div key={slides[current].id} className="text-white space-y-6 max-w-md lg:max-w-lg transition-all duration-700 animate-fadeIn">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                {slides[current].title}
              </h1>

              <div className="space-y-2 text-base lg:text-lg text-gray-300">
                {slides[current].features.map((f) => <p key={f}>{f}</p>)}
              </div>

              <Link
                to={slides[current].link}
                className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition duration-200"
              >
                Shop Now
              </Link>
            </div>

            {/* Right: Image */}
            <div key={slides[current].id + 'img'} className="flex-shrink-0 transition-all duration-700 animate-fadeIn">
              <Link to={slides[current].link}>
                <img
                  src={slides[current].desktopImg}
                  alt={slides[current].title}
                  className="h-[300px] lg:h-[360px] xl:h-[420px] w-auto object-contain"
                />
              </Link>
            </div>

          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition ${i === current? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Banner */}
      <div className="md:hidden relative w-full bg-slate-900 overflow-hidden">
        <img
          src={slides[current].mobileImg}
          alt={slides[current].title}
          className="w-full min-h-[315px] object-cover object-center transition-all duration-700"
        />
        <div key={slides[current].id + 'mobile'} className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
          <h1 className="text-3xl font-bold text-white mb-3">
            {slides[current].title}
          </h1>
          <p className="text-gray-200 mb-6">{slides[current].features[0]}</p>
          <Link
            to={slides[current].link}
            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-semibold"
          >
            Shop Now
          </Link>
        </div>

        {/* Mobile Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${i === current? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Fade Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      .animate-fadeIn { animation: fadeIn 0.7s ease-out; }
      `}</style>
    </div>
  )
}

export default HeroBanner