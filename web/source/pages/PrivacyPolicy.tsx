import React from "react";
import { Footer } from "../components";
import { Card, CardContent } from "../components/ui/Card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 pt-24">
        <Card className="glass-card">
          <CardContent className="p-8 sm:p-12">
            <div className="mb-8 border-b border-white/10 pb-8">
              <h1 className="text-3xl font-bold text-white text-glow mb-4">Privacy Policy</h1>
              <p className="text-gray-400">Last updated: November 2025</p>
            </div>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                <p>
                  Welcome to PickIt. We respect your privacy and are committed to
                  protecting your personal data. This privacy policy will inform
                  you as to how we look after your personal data when you visit
                  our website and tell you about your privacy rights and how the
                  law protects you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
                <p>
                  We may collect, use, store and transfer different kinds of
                  personal data about you which we have grouped together follows:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Identity Data includes first name, last name, username.</li>
                  <li>Contact Data includes email address.</li>
                  <li>Technical Data includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
                  <li>Usage Data includes information about how you use our website and services.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
                <p>
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal or regulatory obligation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
                <p>
                  We have put in place appropriate security measures to prevent
                  your personal data from being accidentally lost, used or
                  accessed in an unauthorized way, altered or disclosed. In
                  addition, we limit access to your personal data to those
                  employees, agents, contractors and other third parties who have
                  a business need to know.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our
                  privacy practices, please contact us at support@pickit.com.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
