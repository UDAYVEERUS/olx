function CTASection() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of users buying and selling on our platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/post-ad" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            Post Your Ad
          </a>
          <a href="/categories" className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Browse Products
          </a>
        </div>
      </div>
    </div>
  );
}
export default CTASection