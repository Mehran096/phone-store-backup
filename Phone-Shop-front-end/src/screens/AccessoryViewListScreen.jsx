import { useGetAccessoriesQuery } from '../slices/accessoriesApiSlice'
import AccessoryCard from '../components/AccessoryCard'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Paginate from '../components/Paginate'

const AccessoryViewListScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const siteUrl = 'https://phone-store.asia'

  const pageNumber = Number(searchParams.get('accessoryPage')) || 1
  const typeFilter = searchParams.get('type') 
  const brandFilter = searchParams.get('brand') 
  const filter = searchParams.get('filter') || ''
  const keyword = searchParams.get('keyword') || ''

  const { data, isLoading, error } = useGetAccessoriesQuery({
    keyword,
    pageNumber, // <-- FIX 2: send pageNumber
    pageSize: 8, // 8 per page for "View All"
    type: typeFilter || '',
    brand: brandFilter || '',
    filter,
  })

  const products = data?.accessories || []
  const pages = data?.pages || 1
  const page = data?.page || 1

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('accessoryPage', pageNum)
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ===== SEO LOGIC =====
  const pageTitle = typeFilter
   ? `${typeFilter} for Mobile | phone-store.asia`
    : brandFilter
   ? `${brandFilter} Accessories | phone-store.asia`
    : 'All Mobile Accessories | phone-store.asia'

  const pageDescription = typeFilter
   ? `Shop ${typeFilter}s for all phone models at best price. ${data?.total || 1000}+ ${typeFilter}s with fast delivery across Pakistan.`
    : brandFilter
   ? `Buy original ${brandFilter} Accessories online. Chargers, Cases, Cables and more for ${brandFilter} phones.`
    : `Shop 1000+ Mobile Accessories online in Pakistan. Cases, Chargers, Cables, Holders with best prices and fast delivery.`

  const canonicalUrl = `${siteUrl}/accessories${searchParams.toString()? `?${searchParams.toString()}` : ''}`

  return (
    <div className='container mx-auto px-4 py-8'>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>
          {typeFilter ? `${typeFilter}s` : brandFilter ? `${brandFilter} Accessories` : 'All Accessories'}
        </h1>
        <Link to='/' className='text-blue-600 hover:underline text-sm'>← Back to Home</Link>
      </div>

      {isLoading? (
        <Loader />
      ) : error? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : products.length === 0 ? (
        <Message>No Accessories Found</Message>
      ) : (
        <>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((accessory) => (
              <AccessoryCard key={accessory._id} accessory={accessory} />
            ))}
          </div>

          <div className='mt-10 flex justify-center'>
            <Paginate 
              pages={pages} 
              page={page} 
              onPageChange={handlePageChange} 
            />
          </div>
        </>
      )}
    </div>
  )
}
export default AccessoryViewListScreen