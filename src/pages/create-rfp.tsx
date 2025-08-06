import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function CreateRFP() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!file) throw new Error('File is required');
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const uploadRes = await fetch('/api/rfp-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'File upload failed');
      // 2. Create RFP
      const rfpRes = await fetch('/api/rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          file: uploadData.filePath,
        }),
      });
      const rfpData = await rfpRes.json();
      if (!rfpRes.ok) throw new Error(rfpData.message || 'RFP creation failed');
      router.push('/my-rfps');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Create RFP</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          type="file"
          className="w-full border p-2 rounded"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={e => setFile(e.target.files?.[0] || null)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create RFP'}
        </button>
      </form>
    </div>
  );
}