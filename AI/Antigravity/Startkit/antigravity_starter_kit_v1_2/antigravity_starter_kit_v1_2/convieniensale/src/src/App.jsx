import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import StaffView from './views/StaffView';
import SignageView from './views/SignageView';
import CustomerMobileView from './views/CustomerMobileView';
import SuperAdminView from './views/SuperAdminView';
import StoreAdminView from './views/StoreAdminView';
import { ErrorBoundary } from './ErrorBoundary';

function CustomerDemoRedirect() {
  let recipeId = 'rec_ext_1';
  try {
    recipeId = localStorage.getItem('demo_sync_recipe_id') || 'rec_ext_1';
  } catch (e) {}
  return <Navigate to={`/recipe/${recipeId}`} replace />;
}

function AppContent() {
  const location = window.location.pathname;
  // Vis kun dev-menuen på admin siderne, skjul den på de rigtige skærme
  const showHeader = location.includes('/admin');

  return (
    <div className="app">
      {showHeader && (
        <header className="app-header">
          <div className="logo">MenyMenu<span className="text-primary">.</span></div>
          <nav className="flex gap-4" style={{fontSize: '0.875rem'}}>
            <Link to="/staff" className="text-muted" style={{textDecoration:'none'}}>Medarbejder Tablet</Link>
            <Link to="/signage" className="text-muted" style={{textDecoration:'none'}}>Butiksskærm</Link>
            <Link to="/demo" className="text-muted" style={{textDecoration:'none'}}>Kunde Mobil Demo</Link>
            <span style={{borderLeft: '1px solid #ccc', margin: '0 8px'}}></span>
            <Link to="/admin/store" className="text-muted" style={{textDecoration:'none'}}>Lokal Admin</Link>
            <Link to="/admin/super" className="text-muted" style={{textDecoration:'none'}}>Global Admin</Link>
          </nav>
        </header>
      )}

      <main>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<StaffView />} />
            <Route path="/staff" element={<StaffView />} />
            <Route path="/signage" element={<SignageView />} />
            <Route path="/demo" element={<CustomerDemoRedirect />} />
            <Route path="/recipe/:id" element={<CustomerMobileView />} />
            <Route path="/admin/super" element={<SuperAdminView />} />
            <Route path="/admin/store" element={<StoreAdminView />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
