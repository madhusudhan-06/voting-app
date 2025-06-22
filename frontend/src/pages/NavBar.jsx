import { useEffect } from 'react';
import './NavBar.css';
import { useNavigate, Link } from 'react-router-dom';
import appLogo from '../assests/app-logo.jpg';

const Navbar = () => {
  useEffect(() => {

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,ta,te,ml,bn,gu,mr,pa,kn,ur,fr,es,de,zh-CN,ja,ko,ru,it,tr,ar",
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );

      // Force visibility
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.style.opacity = '1';
          select.style.visibility = 'visible';
        }
      }, 1000);
    };

    const loadGoogleTranslate = () => {
      if (!window.google || !window.google.translate || !document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;

        script.onload = () => {
          console.log('Google Translate loaded');
          // Force re-render if needed
          const event = new Event('google-translate-loaded');
          window.dispatchEvent(event);
        };

        script.onerror = () => {
          console.error('Google Translate failed to load');
        };

        document.body.appendChild(script);
      }
    };
    loadGoogleTranslate();

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={appLogo} alt="VoteEase" className="nav-logo" />
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </div>
      <div className="nav-right">
        <div className="translate-container">
          <div id="google_translate_element"></div>
        </div>
        {token && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;