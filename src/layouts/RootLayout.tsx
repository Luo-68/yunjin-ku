import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RootLayout() {
  const { pathname } = useLocation();
  
  // Share和Gallery页面不需要Footer
  const isSharePage = pathname === '/share';
  const isGalleryPage = pathname === '/gallery';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-800 text-mist-100 selection:bg-gold-500/30 selection:text-gold-100">
      <Navbar />
      <main className="flex-grow pt-24 min-h-screen">
        <Outlet />
      </main>
      {!isSharePage && !isGalleryPage && <Footer />}
    </div>
  );
}