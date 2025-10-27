import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/footer";

const logo = "/logo.png";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
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
        <div className="flex flex-col items-center mb-16 text-center">
          <img
            src={logo}
            alt="PickIt Logo"
            className="w-16 h-16 mb-4 rounded-full border border-white/20"
          />
          <h1 className="text-5xl font-bold">About PickIt</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Smarter insights. Sharper bets. A new way to play.
          </p>
        </div>

        {/* About Bubble */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 leading-relaxed text-gray-300 space-y-10">
          {/* Our Mission */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p>
              At <strong>PickIt</strong>, we’re rethinking how fans approach
              sports betting. Instead of relying on gut feelings or guesswork,
              PickIt helps bettors use <span className="text-yellow-400">data-driven strategies</span> and
              machine-learning insights to make confident, responsible decisions.
            </p>
          </section>

          {/* What We Do */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
            <p>
              We combine historical sports data, real-time odds from multiple
              sportsbooks, and algorithmic analysis to identify value plays and
              arbitrage opportunities. Our platform simplifies complex analytics
              into clear insights — whether you’re a casual fan exploring trends
              or an experienced bettor optimizing your picks.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Aggregates real-time odds from 10+ major sportsbooks</li>
              <li>Analyzes historical outcomes to find statistical edges</li>
              <li>Delivers actionable insights through a simple dashboard</li>
              <li>Encourages responsible, informed participation</li>
            </ul>
          </section>

          {/* The Technology */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">The Technology</h2>
            <p>
              PickIt is powered by cutting-edge analytics. Our algorithms evaluate
              thousands of past games and line movements to uncover hidden
              probabilities and expected values. The result? Objective insights
              you can trust — all processed instantly and beautifully visualized
              within our clean, modern interface.
            </p>
          </section>

          {/* Our Vision */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p>
              We believe betting should feel like strategy, not chance. Our goal
              is to make PickIt the go-to hub for <strong>smart, responsible, and
              data-informed sports analytics</strong>. As we grow, we aim to
              expand beyond insights into community features, predictive
              modeling, and real-time personalization powered by AI.
            </p>
          </section>

          {/* Contact CTA */}
          <section className="text-center">
            <p className="text-lg">
              Want to learn more or collaborate with us?
            </p>
            <Link
              to="/support"
              className="inline-block mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-full transition"
            >
              Contact Our Team
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
