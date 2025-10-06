import { CurrencyDollarIcon, PhoneArrowDownLeftIcon, ShieldCheckIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: <ShoppingBagIcon className="h-8 w-8" />,
      title: 'Wide Selection',
      description: 'Thousands of products across multiple categories'
    },
    {
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
      title: 'Quick & Easy',
      description: 'Post your ad in minutes and reach thousands'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Safe & Secure',
      description: 'Verified sellers and secure transactions'
    },
    {
      icon: <PhoneArrowDownLeftIcon className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Always here to help with any questions'
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The best platform to buy and sell items in your local area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default FeaturesSection;