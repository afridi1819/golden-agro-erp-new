import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar.jsx';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-theme-black">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-auto text-gray-200">

        {/* Mobile Menu Button */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-dark border border-theme-border text-primary-400"
          >
            <Menu size={22} />
            Menu
          </button>
        </div>

        <Outlet />

      </main>
    </div>
  );
};

export default MainLayout;