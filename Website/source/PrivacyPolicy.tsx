import React from "react";
const logo = "/logo.png";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url('Background.jpeg')",
        }}
      />

      <main className="relative z-10 max-w-4xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <img
            src={logo}
            alt="PickIt Logo"
            className="w-16 h-16 mb-4 rounded-full border border-white/20"
          />
          <h1 className="text-5xl font-bold">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Effective Date: September 2025</p>
        </div>

        <div className="space-y-12 text-gray-300 leading-relaxed">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
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

          {/* 2. Data Collection & Storage */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Data Collection & Storage
            </h2>
            <p>We may collect the following types of data:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Account Information:</strong> name, email, and login
                details.
              </li>
              <li>
                <strong>Usage Data:</strong> interactions, preferences, logs.
              </li>
              <li>
                <strong>Device & Analytics Data:</strong> device model, OS
                version, performance/analytics metrics.
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> cookies, local storage,
                and similar technologies to personalize and measure performance.
              </li>
            </ul>
            <p>
              We store data securely and only as long as needed for the purposes
              described in this policy or as required by law.
            </p>
          </section>

          {/* 3. Use of Data */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Use of Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and operate our services and features.</li>
              <li>Personalize your experience and improve the product.</li>
              <li>Conduct analytics and monitor usage trends.</li>
              <li>Send updates, notifications, and support messages.</li>
              <li>Maintain security, prevent fraud, and enforce terms.</li>
            </ul>
          </section>

          {/* 4. Sharing & Third Parties */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Sharing & Third Parties
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

          {/* 5. Data Retention & Deletion */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Data Retention & Deletion
            </h2>
            <p>
              We retain personal data only as long as necessary for the purposes
              described or as required by law. When no longer needed, we delete
              or anonymize it securely.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Withdraw consent when processing is based on consent.</li>
              <li>Request data portability.</li>
            </ul>
            <p>To exercise these rights, contact us using the details below.</p>
          </section>

          {/* 7. Children & Minors */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Children & Minors</h2>
            <p>
              Our services are not directed to children under 13. We do not
              knowingly collect personal data from children. If you believe we
              have collected such data, contact us to request deletion.
            </p>
          </section>

          {/* 8. Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Security</h2>
            <p>
              We implement technical and administrative safeguards (e.g.,
              encryption, access controls, monitoring) to protect your data from
              unauthorized access, alteration, or disclosure.
            </p>
          </section>

          {/* 9. Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              update the “Effective Date” and notify you through the app or
              website where appropriate. Continued use after changes indicates
              acceptance.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>
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

      <footer className="relative z-10 py-12 px-6 border-t border-white/10 text-center">
        <p className="text-gray-400 text-sm">© 2025 PickIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

