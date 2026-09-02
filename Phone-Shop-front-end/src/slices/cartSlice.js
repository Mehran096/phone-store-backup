import { createSlice } from '@reduxjs/toolkit'
import { calculateBulkPrice } from '../utils/calculateBulkPrice'

const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : []

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {}

const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? localStorage.getItem('paymentMethod')
  : 'Stripe'

const itemsPriceFromStorage = localStorage.getItem('itemsPrice')
  ? localStorage.getItem('itemsPrice')
  : 0

const initialState = {
  cartItems: cartItemsFromStorage,
  shippingAddress: shippingAddressFromStorage,
  paymentMethod: paymentMethodFromStorage,
  itemsPrice: itemsPriceFromStorage,
}

const updateCart = (state) => {
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2)
  }

 // FIX: Use helper for bulk pricing
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => {
      const { totalPrice } = calculateBulkPrice(item.price, item.qty, item.bulkPricing)
      return acc + totalPrice
    }, 0)
  )

  localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  localStorage.setItem('itemsPrice', state.itemsPrice)
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload

      // NEW: Calculate price based on qty when adding
      const { pricePerItem, totalPrice, appliedTier } = calculateBulkPrice(
        item.price, 
        item.qty, 
        item.bulkPricing
      )

      // FIX: Key now includes model + variantSubName
      const existItem = state.cartItems.find(
        (x) => 
          x.product === item.product && 
          x.model === item.model && // NEW
          x.color === item.color && 
          x.storage === item.storage &&
          x.variantType === item.variantType &&
          x.variantName === item.variantName &&
          x.variantSubName === item.variantSubName // NEW
      )

      if (existItem) {
        existItem.qty = item.qty
        existItem.displayPrice = pricePerItem // NEW: show bulk price
        existItem.totalPrice = totalPrice     // NEW: for cart item total
        existItem.appliedBulkTier = appliedTier
      } else {
        state.cartItems = [...state.cartItems, { 
          ...item,
          displayPrice: pricePerItem, // NEW
          totalPrice: totalPrice,     // NEW
          appliedBulkTier: appliedTier
        }]
      }

      updateCart(state)
    },

    removeFromCart: (state, action) => {
      const { product, model, color, storage, variantType, variantName, variantSubName } = action.payload
      state.cartItems = state.cartItems.filter(
        (x) => !(
          x.product === product && 
          x.model === model && // NEW
          x.color === color && 
          x.storage === storage &&
          x.variantType === variantType &&
          x.variantName === variantName &&
          x.variantSubName === variantSubName // NEW
        )
      )
      updateCart(state)
    },

    updateCartQty: (state, action) => {
      const { product, model, color, storage, variantType, variantName, variantSubName, qty } = action.payload
      const existItem = state.cartItems.find(
        (x) => 
          x.product === product && 
          x.model === model &&
          x.color === color && 
          x.storage === storage &&
          x.variantType === variantType &&
          x.variantName === variantName &&
          x.variantSubName === variantSubName
      )
      if (existItem) {
        existItem.qty = qty
        // NEW: Recalculate price when qty changes
        const { pricePerItem, totalPrice, appliedTier } = calculateBulkPrice(
          existItem.price, 
          qty, 
          existItem.bulkPricing
        )
        existItem.displayPrice = pricePerItem
        existItem.totalPrice = totalPrice
        existItem.appliedBulkTier = appliedTier
      }
      updateCart(state)
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress))
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload
      localStorage.setItem('paymentMethod', action.payload)
    },

    setCartItems: (state, action) => {
      state.cartItems = action.payload
      updateCart(state)
    },

    clearCartItems: (state) => {
      state.cartItems = []
      state.itemsPrice = 0
      localStorage.removeItem('cartItems')
      localStorage.removeItem('itemsPrice')
    },

    resetCart: (state) => {
      state.cartItems = []
      state.shippingAddress = {}
      state.paymentMethod = ''
      state.itemsPrice = 0
      localStorage.removeItem('cartItems')
      localStorage.removeItem('shippingAddress')
      localStorage.removeItem('paymentMethod')
      localStorage.removeItem('itemsPrice')
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  setCartItems,
  resetCart,
} = cartSlice.actions

export default cartSlice.reducer