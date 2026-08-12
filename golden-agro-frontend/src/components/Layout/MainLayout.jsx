import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar.jsx';

const MainLayout = () => {
  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-theme-black">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto text-gray-200">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;