const RECENT_KEY = 'recentlyViewed_v4' // MUST MATCH ProductScreen
const MAX_ITEMS = 8

export const addToRecentlyViewed = (product) => {
  let recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || []
  
  // REMOVE SAME VARIANT
  recent = recent.filter(item => item._id !== product._id)
  
  // ADD NEW TO FRONT
  recent.unshift(product)
  
  // KEEP 8 MAX
  recent = recent.slice(0, MAX_ITEMS)
  
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export const getRecentlyViewed = () => {
  const recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || []
  return recent // <- NO FILTER ANYMORE
}

export const clearRecentlyViewed = () => {
  localStorage.removeItem(RECENT_KEY)
}