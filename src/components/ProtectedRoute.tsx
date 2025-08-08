import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import useAuth from 'hooks/useAuth';
import { Props } from 'interfaces';


export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { loading } = useAuth(allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return <>{children}</>;
}
