import { useNavigate } from "react-router";
import "../styles/navbar.css";
import LogoIcon from "./LogoIcon";
import { navLink } from "../shared/global";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <LogoIcon size={16} />
        </div>
        <span className="navbar__logo-text">ResearchAI</span>
      </div>

      {/* Nav links */}
      <div className="navbar__links">
        {navLink.map((item) => (
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
