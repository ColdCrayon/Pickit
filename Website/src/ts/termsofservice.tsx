import React from 'react';

const TermsOfService = () => {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
            Terms of Service
          </h1>
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p className="text-xl font-light">
              Welcome to Pickit! These Terms of Service govern your use of our betting solutions platform. Please read them carefully.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                <p>By accessing and using Pickit's services, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Use License</h3>
                <p>Permission is granted to temporarily use Pickit's services for personal, non-commercial transitory viewing only. This license shall automatically terminate if you violate any of these restrictions.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Disclaimer</h3>
                <p>The materials on Pickit's platform are provided on an 'as is' basis. Pickit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Limitations</h3>
                <p>In no event shall Pickit or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Pickit's services.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Privacy Policy</h3>
                <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws and regulations of the jurisdiction in which Pickit operates.</p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-sm text-gray-400">
                <strong>Last Updated:</strong> January 1, 2024
              </p>
              <p className="text-sm text-gray-400 mt-2">
                If you have any questions about these Terms of Service, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;