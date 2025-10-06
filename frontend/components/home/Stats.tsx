import { ArrowTrendingUpIcon, HeartIcon, ShoppingBagIcon, UsersIcon } from "@heroicons/react/24/outline";

function StatsSection() {
  const stats = [
    { icon: <UsersIcon className="h-8 w-8" />, value: '50K+', label: 'Active Users' },
    { icon: <ShoppingBagIcon className="h-8 w-8" />, value: '100K+', label: 'Products Listed' },
    { icon: <ArrowTrendingUpIcon className="h-8 w-8" />, value: '25K+', label: 'Sold Items' },
    { icon: <HeartIcon className="h-8 w-8" />, value: '98%', label: 'Satisfaction' }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsSection;