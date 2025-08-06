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

export default function MyRFPs() {
  const [rfps, setRfps] = useState([]);
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
    if (!decoded || decoded.role !== 'Buyer') {
      router.replace('/dashboard');
      return;
    }
    fetchRFPs();
  }, [router]);

  const fetchRFPs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rfp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch RFPs');
      setRfps(data.rfps || []);
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
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <span className="font-bold text-xl">My RFPs</span>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/create-rfp')}
        >
          Create New RFP
        </button>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {rfps.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No RFPs created yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {rfps.map((rfp: any) => (
              <Card key={rfp._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{rfp.title}</h3>
                    <p className="text-gray-600 mt-2">{rfp.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(rfp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={rfp.status} />
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => router.push(`/review-responses?rfp=${rfp._id}`)}
                    >
                      Review Responses
                    </button>
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