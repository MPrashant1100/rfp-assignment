import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded || !decoded.role) {
      router.replace('/login');
      return;
    }
    setRole(decoded.role);
  }, [router]);

  if (!role) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <span className="font-bold text-xl">RFP Dashboard</span>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
        >Logout</button>
      </nav>
      <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome, {role}</h2>
        {role === 'Buyer' ? (
          <ul className="space-y-2">
            <li><a href="/create-rfp" className="text-blue-600 hover:underline">Create RFP</a></li>
            <li><a href="/my-rfps" className="text-blue-600 hover:underline">My RFPs</a></li>
            <li><a href="/review-responses" className="text-blue-600 hover:underline">Review Responses</a></li>
          </ul>
        ) : (
          <ul className="space-y-2">
            <li><a href="/browse-rfps" className="text-blue-600 hover:underline">Browse RFPs</a></li>
            <li><a href="/my-responses" className="text-blue-600 hover:underline">My Responses</a></li>
          </ul>
        )}
      </div>
    </div>
  );
}