import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";

const logo = "/logo.png";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="opacity-40">/</span>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 leading-7">
          <p className="text-sm text-gray-300 mb-6">
            <span className="font-semibold">Effective Date:</span> 2/9/2025
          </p>

          <p className="mb-6">
            Welcome to Pickit! By accessing or using our sports betting advice app, you agree to these
            Terms of Service. If you do not agree, please do not use the App.
          </p>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">1. Eligibility</h2>
            <p>
              You must be at least 18 years old (or the legal age in your jurisdiction) to use this App.
              By using the App, you confirm that you meet the eligibility requirements.
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">2. No Real Money Gambling</h2>
            <p>
              Pickit does not facilitate real-money gambling, betting, or wagering. We provide sports
              betting advice, insights, and analytics for entertainment and informational purposes only.
              Any decisions you make based on our content are at your own risk.
            </p>
            <p className="italic text-gray-300">
              Apple Compliance Notice: This app does not enable, support, or promote gambling activities
              and complies with Apple’s App Store Review Guidelines, including Section 5.3 (Gaming,
              Gambling, and Lotteries).
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">3. Responsible Betting Disclaimer</h2>
            <p>
              We encourage responsible betting and do not endorse excessive gambling. If you or someone
              you know has a gambling problem, please seek help from a certified gambling support
              organization in your area (e.g., National Council on Problem Gambling — 1-800-522-4700).
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">4. User Accounts &amp; Subscriptions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may be required to create an account to access premium features.</li>
              <li>If you subscribe to paid services, you agree to our billing and cancellation terms available in the App.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">5. Prohibited Conduct</h2>
            <p className="mb-2">By using the App, you agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the App for illegal gambling or real-money wagering.</li>
              <li>Share false or misleading information.</li>
              <li>Attempt to hack, exploit, or manipulate the App’s algorithms.</li>
              <li>Violate any applicable laws or Apple’s Developer Policies.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts violating these Terms.
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p>
              All content, trademarks, and features within the App are owned by Pickit or its licensors.
              You may not copy, distribute, or modify any App content without prior written permission.
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p>
              Pickit is not responsible for any financial loss, betting losses, or other damages
              resulting from your use of our advice or predictions. The App is provided “AS IS”
              without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">8. Privacy Policy</h2>
            <p>
              Our Privacy Policy governs how we collect, use, and protect your data. By using the App,
              you agree to the terms outlined in our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3 mb-8">
            <h2 className="text-xl font-semibold">9. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the App after changes take
              effect means you accept the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contact Us</h2>
            <p>
              For questions or concerns, contact us at{" "}
              <a href="mailto:support@email.com" className="underline hover:text-white">
                support@email.com
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
