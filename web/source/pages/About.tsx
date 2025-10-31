import React from "react";
import { Link } from "react-router-dom";
import { ContentPageLayout } from "../components";

const About: React.FC = () => {
  return (
    <ContentPageLayout
      title="About PickIt"
      subtitle="Smarter insights. Sharper bets. A new way to play."
      showLogo={true}
    >
      {/* About Bubble */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 leading-relaxed text-gray-300 space-y-10">
        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p>
            At <strong>PickIt</strong>, we're rethinking how fans approach
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
            into clear insights — whether you're a casual fan exploring trends
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
    </ContentPageLayout>
  );
};

export default About;
