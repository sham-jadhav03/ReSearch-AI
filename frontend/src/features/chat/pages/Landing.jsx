import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import "../styles/landing.css";
import LogoIcon from "../shared/LogoIcon";
import { FEATURES, Pipeline, STATS } from "../shared/global";
import { FeatureCard, Fonts } from "../components/Reuse";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <Fonts />

      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero__glow-purple" />
        <div className="hero__glow-blue" />

        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Powered by Gemini 2.5 · Live web search
        </div>

        {/* Headline */}
        <h1 className="hero__headline">
          Ask anything.{" "}
          <span className="hero__headline-gradient">Get answers</span> backed by
          the web.
        </h1>

        {/* Subheadline */}
        <p className="hero__subheadline">
          ResearchAI retrieves real-time information, reasons over it, and
          delivers source-backed answers — not guesses.
        </p>

        {/* CTAs */}
        <div className="hero__ctas">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Start researching free
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              document
                .getElementById("features")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            See how it works
          </button>
        </div>

        {/* Stats */}
        <div className="hero__stats">
          {STATS.map(({ value, label }) => (
            <div key={label} className="hero__stat">
              <p className="hero__stat-value">{value}</p>
              <p className="hero__stat-label">{label}</p>
            </div>
          ))}
        </div>
      </section>


         {/* feature */}
      <section id="features" className="features">
        <div className="features__header">
          <p className="section-label">WHAT IT DOES</p>
          <h2 className="section-title">
            Built different from regular chatbots
          </h2>
        </div>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="pipeline">
        <p className="section-label">THE PIPELINE</p>
        <h2 className="pipeline__title">How every answer is built</h2>

        <div className="pipeline__steps">
          {Pipeline.map((item, i, arr) => (
            <div key={item.step} className="pipeline__step-wrapper">
              <div className="pipeline__step">
                <div className="pipeline__step-box">{item.step}</div>
                <p className="pipeline__step-label">{item.label}</p>
                <p className="pipeline__step-sub">{item.sub}</p>
              </div>
              {i < arr.length - 1 && <div className="pipeline__connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-section">
        <div className="cta-section__glow" />
        <h2 className="cta-section__headline">
          Stop guessing.
          <br />
          Start knowing.
        </h2>
        <p className="cta-section__sub">
          Real answers. Real sources. Right now.
        </p>
        <button className="btn-cta" onClick={() => navigate("/login")}>
          Launch ResearchAI →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__logo">
          <div className="footer__logo-icon">
            <LogoIcon size={12} />
          </div>
          <span className="footer__logo-text">ResearchAI</span>
        </div>
        <p className="footer__copy">Built with Gemini · Mistral · LangChain · Tavily</p>
      </footer>
    </div>
  );
};

export default Landing;
