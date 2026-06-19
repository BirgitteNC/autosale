import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StaffView from './views/StaffView';
import SignageView from './views/SignageView';
import CustomerMobileView from './views/CustomerMobileView';
import SuperAdminView from './views/SuperAdminView';
import StoreAdminView from './views/StoreAdminView';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Usynlig header for kunder, men god til dev test */}
        <header className="app-header">
          <div className="logo">MenyMenu<span className="text-primary">.</span></div>
          <nav className="flex gap-4" style={{fontSize: '0.875rem'}}>
            <Link to="/staff" className="text-muted" style={{textDecoration:'none'}}>Medarbejder Tablet</Link>
            <Link to="/signage" className="text-muted" style={{textDecoration:'none'}}>Butiksskærm</Link>
            <Link to="/recipe/rec_ext_1" className="text-muted" style={{textDecoration:'none'}}>Kunde Mobil Demo</Link>
            <span style={{borderLeft: '1px solid #ccc', margin: '0 8px'}}></span>
            <Link to="/admin/store" className="text-muted" style={{textDecoration:'none'}}>Lokal Admin</Link>
            <Link to="/admin/super" className="text-muted" style={{textDecoration:'none'}}>Global Admin</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<StaffView />} />
            <Route path="/staff" element={<StaffView />} />
            <Route path="/signage" element={<SignageView />} />
            <Route path="/recipe/:id" element={<CustomerMobileView />} />
            <Route path="/admin/super" element={<SuperAdminView />} />
            <Route path="/admin/store" element={<StoreAdminView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
