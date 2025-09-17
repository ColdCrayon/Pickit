import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
            Privacy Policy
          </h1>
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p className="text-xl font-light">
              At Pickit, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, subscribe to our services, or contact us for support. This may include your name, email address, and payment information.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Information</h3>
                <ul className="space-y-2 ml-4">
                  <li>• To provide and maintain our services</li>
                  <li>• To process transactions and send confirmations</li>
                  <li>• To communicate with you about your account or our services</li>
                  <li>• To improve our platform and develop new features</li>
                  <li>• To detect, prevent, and address technical issues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Information Sharing</h3>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or when required by law.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Cookies and Tracking</h3>
                <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
                <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. Contact us to exercise these rights.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm text-gray-400">
                <strong>Last Updated:</strong> January 1, 2024
              </p>
              <p className="text-sm text-gray-400 mt-2">
                If you have any questions about this Privacy Policy, please contact us at privacy@pickit.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;