import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Zap } from 'lucide-react';

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <Zap size={16} className="text-primary" />
            <span className="font-heading text-lg tracking-[0.05em] uppercase text-foreground">
              The AI Draft
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="font-body text-xs font-600 tracking-[0.05em] uppercase text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)]"
            >
              Dashboard
            </Link>
            {user && (
              <Link
                to="/suggestions"
                className="font-body text-xs font-600 tracking-[0.05em] uppercase text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)]"
              >
                Suggestions
              </Link>
            )}
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="font-body text-xs font-600 tracking-[0.05em] uppercase text-muted-foreground hover:text-primary transition-colors duration-[var(--duration-fast)]"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-body text-xs text-muted-foreground">{user.displayName}</span>
              <button
                onClick={logout}
                className="font-body text-xs font-600 tracking-[0.05em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-[var(--duration-fast)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="font-body text-xs font-700 tracking-[0.08em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-[var(--radius-md)] hover:brightness-110 transition-all duration-[var(--duration-fast)]"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
