import { Outlet } from 'react-router-dom';
import Footer from './pages/Footer';
import NavBar from "./pages/NavBar";
import './Layout.css';
import ScrollToTop from './ScrollToTop';
const Layout = () => {
  return (
    <div className="layout-container">
      <NavBar />
      <ScrollToTop />
      <main className="content-wrapper page-transition">
        <Outlet /> {/* This is where your page content renders */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;