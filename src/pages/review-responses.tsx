import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ResponseItem {
  _id: string;
  supplier: { email: string };
  file: string;
  status: string;
  createdAt: string;
}

const ReviewResponsesPage: React.FC = () => {
  const router = useRouter();
  const rfpId = Array.isArray(router.query.rfp)
    ? router.query.rfp[0]
    : router.query.rfp;

  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!rfpId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/response?rfp=${rfpId}`, {
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
  }, [rfpId]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/response-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ responseId: id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Status update failed");
      setResponses((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
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
        <span className="font-bold text-xl">Review Responses</span>
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => router.push("/my-rfps")}
        >
          Back to My RFPs
        </button>
      </nav>
      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {responses.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No responses to review.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => (
              <Card key={resp._id}>
                <div className="flex justify-between items-start">
                  <div className="w-2/3">
                    <h3 className="text-lg font-semibold">
                      From: {resp.supplier.email}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(resp.createdAt).toLocaleDateString()}
                    </p>
                    <a
                      href={resp.file}
                      download
                      className="text-blue-600 hover:underline text-sm mt-2 block"
                    >
                      Download Response
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={resp.status} />
                    {resp.status === "Submitted" && (
                      <>
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => updateStatus(resp._id, "Approved")}
                          disabled={updatingId === resp._id}
                        >
                          {updatingId === resp._id ? "Updating…" : "Approve"}
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => updateStatus(resp._id, "Rejected")}
                          disabled={updatingId === resp._id}
                        >
                          {updatingId === resp._id ? "Updating…" : "Reject"}
                        </button>
                      </>
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
};

const ReviewResponses: React.FC = () => (
  <ProtectedRoute allowedRoles={["Buyer"]}>
    <ReviewResponsesPage />
  </ProtectedRoute>
);

export default ReviewResponses;
