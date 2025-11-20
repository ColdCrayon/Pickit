import React from "react";
import { Footer } from "../components";
import { Card, CardContent } from "../components/ui/Card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 pt-24">
        <Card className="glass-card">
          <CardContent className="p-8 sm:p-12">
            <div className="mb-8 border-b border-white/10 pb-8">
              <h1 className="text-3xl font-bold text-white text-glow mb-4">Terms of Service</h1>
              <p className="text-gray-400">Last updated: November 2025</p>
            </div>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Agreement to Terms</h2>
                <p>
                  By accessing our website, you agree to be bound by these Terms
                  of Service and to comply with all applicable laws and
                  regulations. If you do not agree with these terms, you are
                  prohibited from using or accessing this site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the
                  materials (information or software) on PickIt's website for
                  personal, non-commercial transitory viewing only. This is the
                  grant of a license, not a transfer of title, and under this
                  license you may not:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>modify or copy the materials;</li>
                  <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                  <li>attempt to decompile or reverse engineer any software contained on PickIt's website;</li>
                  <li>remove any copyright or other proprietary notations from the materials; or</li>
                  <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. Disclaimer</h2>
                <p>
                  The materials on PickIt's website are provided on an 'as is'
                  basis. PickIt makes no warranties, expressed or implied, and
                  hereby disclaims and negates all other warranties including,
                  without limitation, implied warranties or conditions of
                  merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation
                  of rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Limitations</h2>
                <p>
                  In no event shall PickIt or its suppliers be liable for any
                  damages (including, without limitation, damages for loss of
                  data or profit, or due to business interruption) arising out
                  of the use or inability to use the materials on PickIt's
                  website, even if PickIt or a PickIt authorized representative
                  has been notified orally or in writing of the possibility of
                  such damage.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in
                  accordance with the laws of the State of Delaware and you
                  irrevocably submit to the exclusive jurisdiction of the courts
                  in that State or location.
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

export default TermsOfService;