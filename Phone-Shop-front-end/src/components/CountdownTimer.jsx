import { useState, useEffect } from 'react'

const CountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    if (!endDate) return

    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date()
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((difference / 1000 / 60) % 60)
        
        // Urgent if less than 24 hours
        setIsUrgent(days === 0 && hours < 24)

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`)
        } else {
          setTimeLeft(`${minutes}m left`)
        }
      } else {
        setTimeLeft('Ended')
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // update every minute
    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft || timeLeft === 'Ended') return null

  return (
    <span className={`block text-[10px] px-2 py-0.5 rounded mt-1 font-semibold ${
      isUrgent 
        ? 'bg-red-600 text-white animate-pulse' 
        : 'bg-black/70 text-white'
    }`}>
      ⏰ Ends in: {timeLeft}
    </span>
  )
}

export default CountdownTimer