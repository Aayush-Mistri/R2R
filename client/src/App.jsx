import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BootScreen from './components/BootScreen.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PinPage from './pages/PinPage.jsx';
import ResetPin from './pages/ResetPin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Accounts from './pages/Accounts.jsx';
import Categories from './pages/Categories.jsx';
import Settings from './pages/Settings.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAuth({ children }) {
  const { state } = useAuth();
  if (state === 'loading') return <BootScreen />;
  if (state !== 'authed') return <Navigate to={state === 'guest' ? '/login' : '/pin'} replace />;
  return children;
}

function GuestOnly({ children }) {
  const { state } = useAuth();
  if (state === 'loading') return <BootScreen />;
  if (state === 'authed') return <Navigate to="/" replace />;
  if (state === 'pin' || state === 'setup') return <Navigate to="/pin" replace />;
  return children;
}

function Home() {
  const { state } = useAuth();
  if (state === 'loading') return <BootScreen />;
  if (state === 'guest') return <Landing />;
  if (state === 'pin' || state === 'setup') return <Navigate to="/pin" replace />;
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function Fallback() {
  const { state } = useAuth();
  if (state === 'loading') return <BootScreen />;
  if (state === 'pin' || state === 'setup') return <Navigate to="/pin" replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route path="/reset-pin" element={<ResetPin />} />
        <Route path="/pin" element={<PinPage />} />

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Fallback />} />
      </Routes>
    </>
  );
}
