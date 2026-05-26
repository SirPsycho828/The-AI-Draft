import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
