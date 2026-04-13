import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Recognition = lazy(() => import('@/pages/Recognition'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const EthnicityDetail = lazy(() => import('@/pages/EthnicityDetail'));
const Share = lazy(() => import('@/pages/Share'));
const CreatePost = lazy(() => import('@/pages/CreatePost'));
const About = lazy(() => import('@/pages/About'));
const Login = lazy(() => import('@/pages/Login'));
const Profile = lazy(() => import('@/pages/Profile'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const MuseumVideo = lazy(() => import('@/pages/MuseumVideo'));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink-900">
    <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Layout Routes */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/recognition" element={<Recognition />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/ethnicity/:id" element={<EthnicityDetail />} />
            <Route path="/share" element={<Share />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/museum" element={<MuseumVideo />} />
          </Route>

          {/* Auth Pages (No Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 404 Redirect */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Router>
  );
}