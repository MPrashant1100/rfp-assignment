import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function MyResponses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || decoded.role !== 'Supplier') {
      router.replace('/dashboard');
      return;
    }
    fetchResponses();
  }, [router]);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/response', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch responses');
      setResponses(data.responses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <span className="font-bold text-xl">My Responses</span>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {responses.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No responses submitted yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((response: any) => (
              <Card key={response._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Response to: {response.rfp?.title || 'Unknown RFP'}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={response.status} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 