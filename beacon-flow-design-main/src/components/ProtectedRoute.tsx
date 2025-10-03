import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole, isAdmin } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: AppRole;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireRole, requireAdmin }: ProtectedRouteProps) => {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/');
      return;
    }

    if (requireAdmin && !isAdmin(roles)) {
      navigate('/');
      return;
    }

    if (requireRole && !roles.includes(requireRole)) {
      navigate('/');
      return;
    }
  }, [user, roles, loading, navigate, requireRole, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !isAdmin(roles)) return null;
  if (requireRole && !roles.includes(requireRole)) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
