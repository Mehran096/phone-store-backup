import { Link } from 'react-router-dom'

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    { num: 1, name: 'Sign In', active: step1, link: '/login' },
    { num: 2, name: 'Shipping', active: step2, link: '/shipping' },
    { num: 3, name: 'Payment', active: step3, link: '/payment' },
    { num: 4, name: 'Place Order', active: step4, link: '/placeorder' },
  ]

  // OLD - BROKEN: const currentStep = steps.findIndex(step => step.active) + 1
  // NEW - FIXED: Find the last active step
  const currentStep = steps.map(step => step.active).lastIndexOf(true) + 1
  const currentStepName = steps[currentStep - 1]?.name

  return (
    <nav className="mb-8">
      {/* Mobile: Show "Step 2 of 4: Shipping" */}
      <div className="sm:hidden text-center mb-4">
        <p className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {currentStepName}
        </p>
      </div>

      {/* Desktop: Show full stepper */}
      <ol className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => (
          <li key={step.num} className="flex items-center">
            {step.active ? (
              <Link to={step.link} className="flex flex-col items-center group">
                <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {step.num}
                </span>
                <span className="mt-1 text-xs font-medium text-blue-600 group-hover:text-blue-800 whitespace-nowrap">
                  {step.name}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col items-center">
                <span className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-500 rounded-full text-sm font-medium">
                  {step.num}
                </span>
                <span className="mt-1 text-xs font-medium text-gray-400 whitespace-nowrap">
                  {step.name}
                </span>
              </div>
            )}

            {index < steps.length - 1 && (
              <div className={`h-0.5 w-12 md:w-20 mx-2 mb-5 ${
                steps[index + 1].active ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CheckoutSteps