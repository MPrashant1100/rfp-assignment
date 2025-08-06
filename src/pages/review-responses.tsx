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

export default function ReviewResponses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');
  const router = useRouter();
  const { rfp } = router.query;

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
    if (rfp) {
      fetchResponses();
    }
  }, [router, rfp]);

  const fetchResponses = async () => {
    try {
      const res = await fetch(`/api/response?rfp=${rfp}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch responses');
      setResponses(data.responses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateResponseStatus = async (responseId: string, status: string) => {
    setUpdating(responseId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/response-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responseId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      fetchResponses(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating('');
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
        <span className="font-bold text-xl">Review Responses</span>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {responses.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No responses to review.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((response: any) => (
              <Card key={response._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Response from: {response.supplier?.email || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={response.status} />
                    {response.status === 'Submitted' && (
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => updateResponseStatus(response._id, 'Approved')}
                          disabled={updating === response._id}
                        >
                          {updating === response._id ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => updateResponseStatus(response._id, 'Rejected')}
                          disabled={updating === response._id}
                        >
                          {updating === response._id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    )}
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