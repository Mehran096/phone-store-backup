const Paginate = ({ pages = 1, page = 1, onPageChange }) => {
  const currentPage = Number(page) || 1
  const totalPages = Number(pages) || 1

  if (totalPages <= 1) return null

  const baseBtn = 'px-3 py-2 text-sm font-medium border rounded-md transition'
  const activeBtn = 'bg-blue-600 text-white border-blue-600'
  const inactiveBtn = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (currentPage - delta > 2) range.unshift('...')
    if (currentPage + delta < totalPages - 1) range.push('...')
    range.unshift(1)
    if (totalPages !== 1) range.push(totalPages)
    return range
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mt-6'>
      <div className='text-sm text-gray-700'>
        Page <span className='font-medium'>{currentPage}</span> of <span className='font-medium'>{totalPages}</span>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {currentPage > 1 && <button onClick={() => onPageChange(currentPage - 1)} className={`${baseBtn} ${inactiveBtn}`}>Prev</button>}
        {getPageNumbers().map((pageNum, idx) =>
          pageNum === '...' ? <span key={`dots-${idx}`} className='px-3 py-2'>...</span> :
          <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`${baseBtn} ${pageNum === currentPage ? activeBtn : inactiveBtn}`}>{pageNum}</button>
        )}
        {currentPage < totalPages && <button onClick={() => onPageChange(currentPage + 1)} className={`${baseBtn} ${inactiveBtn}`}>Next</button>}
      </div>
    </div>
  )
}
export default Paginate