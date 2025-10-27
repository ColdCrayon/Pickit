import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";

const logo = "/logo.png";

const PrivacyPolicy: React.FC = () => {
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

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto py-28 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link to="/termsofservice" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Policy Content Bubble */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 leading-7 text-gray-300 space-y-10">
          <p className="text-sm text-gray-400">
            <span className="font-semibold">Effective Date:</span> September 2025
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              PickIt (“we”, “our”, “us”) values your privacy. This Privacy Policy
              explains how we collect, use, share, retain, and protect your
              personal data in compliance with applicable laws and industry best
              practices, and in line with{" "}
              <a
                className="text-yellow-400 hover:underline"
                href="https://developer.apple.com/app-store/review/guidelines/#privacy"
                target="_blank"
                rel="noreferrer"
              >
                Apple’s App Store Review Guidelines (Privacy)
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Data Collection &amp; Storage
            </h2>
            <p>We may collect the following types of data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> name, email, and login details.
              </li>
              <li>
                <strong>Usage Data:</strong> interactions, preferences, logs.
              </li>
              <li>
                <strong>Device &amp; Analytics Data:</strong> device model, OS version,
                performance/analytics metrics.
              </li>
              <li>
                <strong>Cookies &amp; Tracking:</strong> cookies, local storage, and
                similar technologies to personalize and measure performance.
              </li>
            </ul>
            <p>
              We store data securely and only as long as needed for the purposes
              described in this policy or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Use of Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and operate our services and features.</li>
              <li>Personalize your experience and improve the product.</li>
              <li>Conduct analytics and monitor usage trends.</li>
              <li>Send updates, notifications, and support messages.</li>
              <li>Maintain security, prevent fraud, and enforce terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              4. Sharing &amp; Third Parties
            </h2>
            <p>
              We do not sell your personal data. We may share limited data with
              trusted service providers (e.g., analytics, hosting, support) who
              assist our operations and are contractually obligated to protect
              your information.
            </p>
            <p>
              In accordance with Apple’s guidelines, any third party with whom we
              share data must provide at least the same level of protection as we
              do. See{" "}
              <a
                className="text-yellow-400 hover:underline"
                href="https://developer.apple.com/app-store/review/guidelines/#privacy"
                target="_blank"
                rel="noreferrer"
              >
                Apple’s Privacy Guidelines
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Data Retention &amp; Deletion
            </h2>
            <p>
              We retain personal data only as long as necessary for the purposes
              described or as required by law. When no longer needed, we delete or
              anonymize it securely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Withdraw consent when processing is based on consent.</li>
              <li>Request data portability.</li>
            </ul>
            <p>To exercise these rights, contact us using the details below.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Children &amp; Minors</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly
              collect personal data from children. If you believe we have collected
              such data, contact us to request deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Security</h2>
            <p>
              We implement technical and administrative safeguards (e.g., encryption,
              access controls, monitoring) to protect your data from unauthorized
              access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will update the
              “Effective Date” and notify you through the app or website where
              appropriate. Continued use after changes indicates acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
            <p>
              Questions or requests? Contact us at{" "}
              <a
                href="mailto:support@pickit.com"
                className="text-yellow-400 hover:underline"
              >
                support@pickit.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

