import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type Decoded = { userId: string; role: string; exp: number };

function decodeToken(token: string): Decoded | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function useAuth(allowedRoles?: string[]) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Decoded| null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || (allowedRoles && !allowedRoles.includes(decoded.role))) {
      router.replace('/dashboard');
      return;
    }
    setUser(decoded);
    setLoading(false);
  }, [router, allowedRoles]);

  return { loading, user };
}
