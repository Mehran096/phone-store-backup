import { FaWifi } from 'react-icons/fa'
import { Button } from 'react-bootstrap'
import { toast } from 'react-toastify'

const OfflineMessage = ({ refetch, isOnline }) => {
  const handleRetry = () => {
    if (isOnline && refetch) {
      refetch()
    } else {
      toast.error('Still offline. Check your connection.')
    }
  }

  return (
    <div 
      className='d-flex flex-column align-items-center justify-content-center text-center w-100'
      style={{ minHeight: '100%' }}
    >
      <FaWifi
        size={80}
        className='text-muted mb-4'
        style={{ display: 'inline-block' }}
      />
      <h2 className='mb-3'>No Connection</h2>
      <p className='text-muted mb-4 mx-auto' style={{ maxWidth: '450px' }}>
        We can't reach our servers right now. Check your
        internet connection or make sure the backend is running.
      </p>
      {refetch && (
        <Button 
          variant={isOnline ? 'primary' : 'secondary'} 
          size='lg' 
          onClick={handleRetry}
          disabled={!isOnline}
        >
          {isOnline ? 'Try Again' : 'Offline'}
        </Button>
      )}
    </div>
  )
}

export default OfflineMessage