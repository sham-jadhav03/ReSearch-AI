import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import "../styles/landing.css";

const FEATURES = [
  {
    icon: "ri-search-eye-line",
    title: "Real-time web search",
    desc: "Every answer is grounded in live web data — not stale training knowledge.",
  },
  {
    icon: "ri-link-m",
    title: "Inline citations",
    desc: "Sources cited as [1][2][3] with clickable cards — full transparency on every answer.",
  },
  {
    icon: "ri-flashlight-line",
    title: "Token streaming",
    desc: "Answers appear token by token the moment they're generated. No waiting.",
  },
  {
    icon: "ri-file-pdf-2-line",
    title: "Document RAG",
    desc: "Upload PDFs and ask questions — AI answers grounded in your documents.",
  },
  {
    icon: "ri-image-ai-line",
    title: "Vision analysis",
    desc: "Upload images and get intelligent visual analysis powered by Gemini.",
  },
  {
    icon: "ri-brain-line",
    title: "Conversation memory",
    desc: "Multi-turn memory across sessions — context is never lost mid-conversation.",
  },
];

const STATS = [
  { value: "2.5s", label: "Avg. response time" },
  { value: "5+", label: "Live sources per answer" },
  { value: "100%", label: "Source transparency" },
];

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-card__icon">
      <i className={icon} />
    </div>
    <p className="feature-card__title">{title}</p>
    <p className="feature-card__desc">{desc}</p>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        rel="stylesheet"
      />

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
          <span className="hero__headline-gradient">Get answers</span>
          {" "}backed by the web.
        </h1>

        {/* Subheadline */}
        <p className="hero__subheadline">
          ResearchAI retrieves real-time information, reasons over it,
          and delivers source-backed answers — not guesses.
        </p>

        {/* CTAs */}
        <div className="hero__ctas">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Start researching free
          </button>
          <button
            className="btn-secondary"
            onClick={() =>
              document.getElementById("features").scrollIntoView({ behavior: "smooth" })
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

      {/* Features */}
      <section id="features" className="features">
        <div className="features__header">
          <p className="section-label">WHAT IT DOES</p>
          <h2 className="section-title">Built different from regular chatbots</h2>
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
          {[
            { step: "01", label: "You ask", sub: "Any question" },
            { step: "02", label: "Web search", sub: "Tavily retrieval" },
            { step: "03", label: "LLM reasons", sub: "Gemini 2.5" },
            { step: "04", label: "Answer streams", sub: "Token by token" },
            { step: "05", label: "Sources cited", sub: "[1][2][3]" },
          ].map((item, i, arr) => (
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
          Stop guessing.<br />Start knowing.
        </h2>
        <p className="cta-section__sub">Real answers. Real sources. Right now.</p>
        <button className="btn-cta" onClick={() => navigate("/login")}>
          Launch ResearchAI →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__logo">
          <div className="footer__logo-icon">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
            </svg>
          </div>
          <span className="footer__logo-text">ResearchAI</span>
        </div>
        <p className="footer__copy">Built with Gemini · LangChain · Tavily</p>
      </footer>
    </div>
  );
};

export default Landing;