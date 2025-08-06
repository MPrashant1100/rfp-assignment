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

export default function BrowseRFPs() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    fetchRFPs();
  }, [router]);

  const fetchRFPs = async () => {
    try {
      const res = await fetch('/api/rfp');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch RFPs');
      setRfps(data.rfps || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedRfp || !file) return;
    
    setSubmitting(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const uploadRes = await fetch('/api/response-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'File upload failed');

      // Submit response
      const responseRes = await fetch('/api/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rfp: selectedRfp._id,
          file: uploadData.filePath,
        }),
      });
      const responseData = await responseRes.json();
      if (!responseRes.ok) throw new Error(responseData.message || 'Response submission failed');
      
      setSelectedRfp(null);
      setFile(null);
      alert('Response submitted successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
        <span className="font-bold text-xl">Browse RFPs</span>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {rfps.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No RFPs available.</p>
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
                    {rfp.status === 'Published' && (
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                        onClick={() => setSelectedRfp(rfp)}
                      >
                        Submit Response
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {selectedRfp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Submit Response to: {selectedRfp.title}</h3>
              <form onSubmit={handleSubmitResponse}>
                <input
                  type="file"
                  className="w-full border p-2 rounded mb-4"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Response'}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={() => setSelectedRfp(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 