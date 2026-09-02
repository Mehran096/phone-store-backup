import { useState } from 'react'

function MultiImageUploader({ onSlidesUpdate }) {
  const [slides, setSlides] = useState([])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newSlides = files.map((file, idx) => ({
      id: Date.now() + idx,
      title: `Slide ${slides.length + idx + 1}`,
      subtitle: 'Add your subtitle here',
      cta: 'Learn more',
      link: '/shop',
      img: URL.createObjectURL(file),
    }))

    const updatedSlides = [...slides,...newSlides]
    setSlides(updatedSlides)
    onSlidesUpdate(updatedSlides)
  }

  const updateSlide = (id, field, value) => {
    const updated = slides.map(s => s.id === id? {...s, [field]: value } : s)
    setSlides(updated)
    onSlidesUpdate(updated)
  }

  const removeSlide = (id) => {
    const updated = slides.filter(s => s.id!== id)
    setSlides(updated)
    onSlidesUpdate(updated)
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="multiUpload"
        />
        <label
          htmlFor="multiUpload"
          className="cursor-pointer inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Select Images from Gallery
        </label>
        <p className="text-sm text-gray-500 mt-2">Use PNG with transparent background for no white box</p>
      </div>

      {slides.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Uploaded Slides: {slides.length}</h3>
          {slides.map((slide) => (
            <div key={slide.id} className="flex gap-4 p-3 bg-white border rounded-lg items-center">
              <img src={slide.img} alt="" className="w-16 h-16 object-contain bg-gray-100 rounded" />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  placeholder="Subtitle"
                />
              </div>
              <button
                onClick={() => removeSlide(slide.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiImageUploader