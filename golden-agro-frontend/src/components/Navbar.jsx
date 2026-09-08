import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <img
            src="/logo.png"
            alt="Golden Agro Foods"
          />

          <span>
            Golden Agro Foods
          </span>
        </Link>

        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>

          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/products-showcase"
              className={`nav-link ${isActive('/products-showcase') ? 'active' : ''
                }`}
              onClick={closeMenu}
            >
              Products
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/our-factory"
              className={`nav-link ${isActive('/our-factory') ? 'active' : ''
                }`}
              onClick={closeMenu}
            >
              Our Factory
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/contact-us"
              className={`nav-link ${isActive('/contact-us') ? 'active' : ''
                }`}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>

          {user ? (
            <>
              <li className="nav-item">
                <Link
                  to="/app/dashboard"
                  className={`nav-link ${location.pathname.startsWith('/app')
                      ? 'active'
                      : ''
                    }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>

              <li className="nav-item nav-cta">
                <button
                  type="button"
                  className="nav-btn-login"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/register"
                  className={`nav-link ${isActive('/register') ? 'active' : ''
                    }`}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>

              <li className="nav-item nav-cta">
                <Link
                  to="/login"
                  className="nav-btn-login"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
            </>
          )}

        </ul>

      </div>
    </nav>
  );
};

export default Navbar;
