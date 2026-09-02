import { useState } from 'react'
import { useUpdateProductSpecsMutation } from '../slices/productsApiSlice'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'

const ProductSpecs = ({ product, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [specs, setSpecs] = useState(product?.specs || {})
  
  const [updateSpecs, { isLoading }] = useUpdateProductSpecsMutation()
useEffect(() => {
    setSpecs(product?.specs || {})
  }, [product])
  const handleChange = (e) => {
    setSpecs({ ...specs, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      await updateSpecs({ id: product._id, specs }).unwrap()
      toast.success('Specs updated')
      setIsEditing(false)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const specFields = [
    { name: 'storage', label: 'Storage' },
    { name: 'ram', label: 'RAM' },
    { name: 'display', label: 'Display' },
    { name: 'battery', label: 'Battery' },
    { name: 'camera', label: 'Camera' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Specifications
        </h3>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {specFields.map(
            (field) =>
              specs[field.name] && (
                <div key={field.name} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {field.label}
                  </span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {specs[field.name]}
                  </p>
                </div>
              )
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {specFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                value={specs[field.name] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${field.label}`}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                         disabled:opacity-50 transition"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setSpecs(product.specs || {})
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white 
                         rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductSpecs