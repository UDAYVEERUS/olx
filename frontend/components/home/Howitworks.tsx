function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Create Account',
      description: 'Sign up for free in just a few clicks',
      image: '👤'
    },
    {
      number: '2',
      title: 'Post Your Ad',
      description: 'Add photos and details about your item',
      image: '📸'
    },
    {
      number: '3',
      title: 'Connect & Sell',
      description: 'Chat with buyers and close the deal',
      image: '💬'
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start buying and selling in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full text-4xl mb-6 shadow-lg">
                  {step.image}
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-blue-200 hidden md:block" 
                     style={{ display: index === steps.length - 1 ? 'none' : 'block' }}></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default HowItWorksSection;