import { useNavigate } from "react-router";
import "../styles/navbar.css";

const Navbar = ({ onLaunch }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
          </svg>
        </div>
        <span className="navbar__logo-text">ResearchAI</span>
      </div>

      {/* Nav links */}
      <div className="navbar__links">
        {["Features", "How it works", "About"].map((item) => (
          <a key={item} href="#" className="navbar__link">
            {item}
          </a>
        ))}
      </div>

      {/* CTA */}
      <button className="navbar__cta" onClick={() => navigate("/login")}>
        Launch App
      </button>
    </nav>
  );
};

export default Navbar;