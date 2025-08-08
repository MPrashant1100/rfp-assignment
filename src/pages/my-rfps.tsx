import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RFP } from "interfaces";

const MyRFPsPage: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rfp", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch your RFPs");
        setRfps(json.rfps ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      const res = await fetch("/api/rfp-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ rfpId: id, status: "Published" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Publish failed");
      setRfps((prev) =>
        prev.map((rfp) =>
          rfp._id === id ? { ...rfp, status: "Published" } : rfp
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishingId(null);
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
          onClick={() => router.push("/create-rfp")}
        >
          New RFP
        </button>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 p-4">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {rfps.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center">No RFPs created yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {rfps.map((rfp) => (
              <Card key={rfp._id}>
                <div className="flex justify-between items-start">
                  <div className="w-2/3">
                    <h3 className="text-lg font-semibold">{rfp.title}</h3>
                    <p className="text-gray-600 mt-2">{rfp.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(rfp.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 space-y-1">
                      <span className="font-medium">Versions:</span>
                      {rfp.versions.map((v) => (
                        <a
                          key={v.version}
                          href={v.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline text-sm"
                        >
                          Version {v.version} &ndash;{" "}
                          {new Date(v.uploadedAt).toLocaleDateString()}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={rfp.status} />
                    {rfp.status === "Draft" ? (
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded text-sm"
                        onClick={() => handlePublish(rfp._id)}
                        disabled={publishingId === rfp._id}
                      >
                        {publishingId === rfp._id ? "Publishing..." : "Publish"}
                      </button>
                    ) : (
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() =>
                          router.push(`/review-responses?rfp=${rfp._id}`)
                        }
                      >
                        Review Responses
                      </button>
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

const MyRFPs: React.FC = () => (
  <ProtectedRoute allowedRoles={["Buyer"]}>
    <MyRFPsPage />
  </ProtectedRoute>
);

export default MyRFPs;
