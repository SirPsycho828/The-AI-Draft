import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            The AI Draft
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            {user && (
              <Link to="/suggestions" className="text-sm text-gray-400 hover:text-white transition-colors">
                Suggestions
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{user.displayName}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
