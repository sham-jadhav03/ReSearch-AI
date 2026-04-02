import { useNavigate } from "react-router";
import Navbar from "./shared/Navbar";

// ─── Feature cards data ───────────────────────────────────────────────────────
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

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px", padding: "28px 24px",
    transition: "border-color 0.2s, background 0.2s",
    cursor: "default",
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "rgba(79,142,247,0.3)";
      e.currentTarget.style.background = "rgba(79,142,247,0.05)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
    }}
  >
    <div style={{
      width: "40px", height: "40px", borderRadius: "12px",
      background: "rgba(79,142,247,0.12)",
      border: "1px solid rgba(79,142,247,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "16px", fontSize: "18px", color: "#4f8ef7",
    }}>
      <i className={icon} />
    </div>
    <p style={{
      fontFamily: "'Syne', sans-serif", fontSize: "15px",
      fontWeight: 600, color: "#f0f0f0", marginBottom: "8px",
    }}>{title}</p>
    <p style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
      color: "rgba(255,255,255,0.4)", lineHeight: "1.65",
    }}>{desc}</p>
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────────
const Loading = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", background: "#06060a",
      color: "#fff", overflowX: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />

      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Purple radial glow — top center */}
        <div style={{
          position: "absolute", top: "-10%", left: "50%",
          transform: "translateX(-50%)",
          width: "800px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Blue glow — bottom left */}
        <div style={{
          position: "absolute", bottom: "10%", left: "-5%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(79,142,247,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "7px 16px", borderRadius: "50px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          marginBottom: "28px", fontSize: "13px",
          color: "rgba(255,255,255,0.6)",
          animation: "fadeUp 0.6s ease both",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#3ecf8e",
            boxShadow: "0 0 6px #3ecf8e",
            display: "inline-block",
          }} />
          Powered by Gemini 2.5 · Live web search
        </div>

        {/* Hero headline */}
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(42px, 7vw, 78px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-2px", marginBottom: "24px",
          maxWidth: "820px",
          animation: "fadeUp 0.7s ease 0.1s both",
        }}>
          Ask anything.{" "}
          <span style={{
            background: "linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Get answers
          </span>
          {" "}backed by the web.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: "17px", color: "rgba(255,255,255,0.45)",
          maxWidth: "500px", lineHeight: "1.7", marginBottom: "44px",
          fontWeight: 300,
          animation: "fadeUp 0.7s ease 0.2s both",
        }}>
          ResearchAI retrieves real-time information, reasons over it,
          and delivers source-backed answers — not guesses.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: "14px", alignItems: "center",
          animation: "fadeUp 0.7s ease 0.3s both",
        }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "14px 32px", borderRadius: "50px",
              background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
              border: "none", color: "#fff",
              fontSize: "15px", fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.1px",
              boxShadow: "0 0 30px rgba(79,142,247,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
          >
            Start researching free
          </button>
          <button
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: "14px 28px", borderRadius: "50px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "15px", fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            See how it works
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "48px", marginTop: "72px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "40px",
          animation: "fadeUp 0.7s ease 0.4s both",
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "28px", fontWeight: 700,
                color: "#fff", marginBottom: "4px",
                background: "linear-gradient(135deg, #fff, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{value}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.3px" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 48px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{
            fontSize: "12px", fontWeight: 600, letterSpacing: "2px",
            color: "#4f8ef7", textTransform: "uppercase", marginBottom: "14px",
          }}>
            WHAT IT DOES
          </p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700,
            color: "#fff", letterSpacing: "-1px",
          }}>
            Built different from regular chatbots
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{
        padding: "100px 48px", textAlign: "center",
        background: "rgba(255,255,255,0.015)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "2px", color: "#4f8ef7", textTransform: "uppercase", marginBottom: "14px" }}>
          THE PIPELINE
        </p>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700,
          color: "#fff", letterSpacing: "-0.8px", marginBottom: "60px",
        }}>
          How every answer is built
        </h2>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0", flexWrap: "wrap", maxWidth: "900px", margin: "0 auto",
        }}>
          {[
            { step: "01", label: "You ask", sub: "Any question" },
            { step: "02", label: "Web search", sub: "Tavily retrieval" },
            { step: "03", label: "LLM reasons", sub: "Gemini 2.5" },
            { step: "04", label: "Answer streams", sub: "Token by token" },
            { step: "05", label: "Sources cited", sub: "[1][2][3]" },
          ].map((item, i, arr) => (
            <div key={item.step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "16px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px",
                  fontSize: "11px", fontWeight: 700, color: "#4f8ef7",
                  letterSpacing: "0.5px", fontFamily: "'Syne', sans-serif",
                }}>
                  {item.step}
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#e0e0e0", marginBottom: "3px" }}>{item.label}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: "32px", height: "1px", background: "rgba(79,142,247,0.3)", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section style={{
        padding: "120px 24px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800,
          color: "#fff", letterSpacing: "-1.5px",
          marginBottom: "18px", lineHeight: 1.1,
        }}>
          Stop guessing.<br />Start knowing.
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", marginBottom: "40px", fontWeight: 300 }}>
          Real answers. Real sources. Right now.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "16px 40px", borderRadius: "50px",
            background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
            border: "none", color: "#fff",
            fontSize: "16px", fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 0 40px rgba(79,142,247,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 0 60px rgba(79,142,247,0.5)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 40px rgba(79,142,247,0.4)"; }}
        >
          Launch ResearchAI →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "7px",
            background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
            </svg>
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
            ResearchAI
          </span>
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
          Built with Gemini · LangChain · Tavily
        </p>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #06060a; }
      `}</style>
    </div>
  );
};

export default Loading;