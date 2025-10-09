export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-blue-100 text-lg">
            Last updated: January 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using MarketPlace, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Maintaining the confidentiality of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring you are at least 18 years old</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Listing Rules</h2>
              <p className="text-gray-600 mb-4">
                When posting listings on MarketPlace, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and truthful descriptions of items</li>
                <li>Use only authentic photos of the actual item</li>
                <li>Not list prohibited or illegal items</li>
                <li>Set fair and reasonable prices</li>
                <li>Honor your commitments to buyers</li>
                <li>Not engage in fraudulent activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Items</h2>
              <p className="text-gray-600 mb-4">
                The following items are strictly prohibited on MarketPlace:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Illegal drugs and drug paraphernalia</li>
                <li>Weapons, firearms, and explosives</li>
                <li>Stolen goods or counterfeit items</li>
                <li>Adult content and services</li>
                <li>Live animals (except through authorized dealers)</li>
                <li>Hazardous materials</li>
                <li>Human body parts or remains</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Harass, abuse, or harm other users</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Spam or send unsolicited messages</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools or bots without permission</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fees and Payments</h2>
              <p className="text-gray-600 mb-4">
                MarketPlace is currently free to use for basic features. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Introduce premium features with associated fees</li>
                <li>Charge for promotional listings</li>
                <li>Modify pricing with reasonable notice</li>
                <li>Process refunds at our discretion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Transactions</h2>
              <p className="text-gray-600 mb-4">
                MarketPlace facilitates connections between buyers and sellers but is not directly involved in transactions. You acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All transactions are between users directly</li>
                <li>We are not responsible for the quality, safety, or legality of items</li>
                <li>We do not guarantee completion of transactions</li>
                <li>Users are responsible for their own safety during meetups</li>
                <li>Payment disputes should be resolved between parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The service and its original content, features, and functionality are owned by MarketPlace and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600 mb-4">
                By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Content Removal</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to remove any content that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Violates these Terms and Conditions</li>
                <li>Infringes on intellectual property rights</li>
                <li>Is reported by users and deemed inappropriate</li>
                <li>Poses a safety risk</li>
                <li>Is deemed harmful to our community</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Account Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Breach of these Terms and Conditions</li>
                <li>Fraudulent activity or misrepresentation</li>
                <li>Multiple user complaints</li>
                <li>Violation of applicable laws</li>
                <li>Prolonged account inactivity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                MarketPlace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Your use or inability to use the service</li>
                <li>Unauthorized access to your data</li>
                <li>Conduct of any third party on the service</li>
                <li>Loss of profits, data, or goodwill</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                Any disputes arising from these terms will be resolved through:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Good faith negotiations between parties</li>
                <li>Mediation if negotiation fails</li>
                <li>Arbitration under Indian law</li>
                <li>Courts of Ghaziabad, Uttar Pradesh as final jurisdiction</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of significant changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Posting the updated terms on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying a notice on our homepage</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-600 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
                <p className="mb-2"><strong>Email:</strong> legal@marketplace.com</p>
                <p className="mb-2"><strong>Phone:</strong> +91 123 456 7890</p>
                <p><strong>Address:</strong> 123 Market Street, Ghaziabad, UP 201001, India</p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mt-8">
              <p className="text-gray-700 font-semibold mb-2">
                By using MarketPlace, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-gray-600 text-sm">
                If you do not agree with any part of these terms, you must discontinue use of our service immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}