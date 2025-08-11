// src/pages/my-responses.tsx
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { isPdfUrl, toCloudinaryDownloadUrl } from "@/lib/cloudinaryUrl";

interface ResponseItem {
  _id: string;
  file: string;
  status: string;
  createdAt: string;
  rfp?: { title: string };
}

const MyResponsesPage: React.FC = () => {
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/response", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load responses");
        setResponses(json.responses ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
            <p className="text-gray-500 text-center">No responses yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => (
              <Card key={resp._id}>
                <div className="flex justify-between items-start">
                  <div className="w-2/3">
                    <h3 className="text-lg font-semibold">
                      Response to: {resp.rfp?.title ?? "Unknown RFP"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(resp.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-x-3">
                      {isPdfUrl(resp.file) && (
                        <a
                          href={resp.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View PDF
                        </a>
                      )}
                      <a
                        href={toCloudinaryDownloadUrl(resp.file)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download Response
                      </a>
                    </div>
                  </div>
                  <StatusBadge status={resp.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyResponses: React.FC = () => (
  <ProtectedRoute allowedRoles={["Supplier"]}>
    <MyResponsesPage />
  </ProtectedRoute>
);

export default MyResponses;
