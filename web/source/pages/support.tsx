import React from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components";

const logo = "/logo.png";

const Support: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          minHeight: "100vh",
          color: "white",
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
            <h1 className="text-3xl font-bold">Support</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Support Content Bubble */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 leading-7 text-gray-300 space-y-10">
          <p className="text-sm text-gray-400">
            <span className="font-semibold">Last Updated:</span> September 2025
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
            <p>
              We're here to make sure your PickIt experience runs smoothly. Whether
              you're having trouble logging in, managing your account, or simply
              have a question, our support team is happy to help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Common Topics</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account setup, login, and password recovery</li>
              <li>Subscription and billing support</li>
              <li>App performance or error troubleshooting</li>
              <li>Feedback, suggestions, or feature requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Our Team</h2>
            <p>
              If you can't find your answer in the FAQ or need direct help, you can
              reach out to us any time:
            </p>
            <ul className="space-y-2 mt-3">
              <li>
                📧 Email:{" "}
                <a
                  href="mailto:support@pickit.com"
                  className="text-yellow-400 hover:underline"
                >
                  support@pickit.com
                </a>
              </li>
              <li>
                🌐 Visit:{" "}
                <a
                  href="https://www.pickit.com/support"
                  className="text-yellow-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  www.pickit.com/support
                </a>
              </li>
              <li>
                🕐 Response Time: We aim to respond within 24 hours on weekdays.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Report a Problem</h2>
            <p>
              Encountered a bug or error? Please include your device type, OS
              version, and a brief description of the issue when contacting us.
              Screenshots are especially helpful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Community & Feedback</h2>
            <p>
              We love hearing from users. Share ideas, suggest features, or tell us
              how PickIt helps you win smarter. Together, we'll keep improving.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
