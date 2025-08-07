import { useState, FormEvent } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Version {
  filePath: string;
  version: number;
  uploadedAt: string;
}

interface RFP {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  versions: Version[];
}

const SearchRFPsPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/search-rfp?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Search failed");
      setResults(json.rfps ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <span className="font-bold text-xl">Search RFPs</span>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        <form onSubmit={handleSearch} className="flex mb-6 space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or description..."
            className="flex-grow border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Search"}
          </button>
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : results.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No results found.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((rfp) => (
              <Card key={rfp._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{rfp.title}</h3>
                    <p className="text-gray-600 mt-2">{rfp.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(rfp.createdAt).toLocaleDateString()}
                    </p>
                    {rfp.versions.length > 0 && (
                      <a
                        href={rfp.versions[0].filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 block"
                      >
                        Download Spec
                      </a>
                    )}
                  </div>
                  <StatusBadge status={rfp.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchRFPs: React.FC = () => (
  <ProtectedRoute allowedRoles={["Supplier"]}>
    <SearchRFPsPage />
  </ProtectedRoute>
);

export default SearchRFPs;
