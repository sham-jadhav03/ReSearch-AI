import { useNavigate } from "react-router";

const Navbar = ({ onLaunch }) => {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "64px",
        background: "rgba(6,6,10,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "9px",
            background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "17px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.3px",
          }}
        >
          ResearchAI
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {["Features", "How it works", "About"].map((item) => (
          <a
            key={item}
            href="#"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              textDecoration: "none",
              transition: "color 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.target.style.color = "rgba(255,255,255,0.9)")
            }
            onMouseLeave={(e) =>
              (e.target.style.color = "rgba(255,255,255,0.5)")
            }
          >
            {item}
          </a>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={()=> navigate('/login')}
        style={{
          padding: "9px 22px",
          borderRadius: "50px",
          background: "linear-gradient(135deg, #4f8ef7, #7c3aed)",
          border: "none",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer",
          letterSpacing: "0.1px",
          boxShadow: "0 0 20px rgba(79,142,247,0.35)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.04)";
          e.target.style.boxShadow = "0 0 30px rgba(79,142,247,0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 0 20px rgba(79,142,247,0.35)";
        }}
      >
        Launch App
      </button>
    </nav>
  );
};
export default Navbar;
