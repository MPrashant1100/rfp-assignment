import { useState, useEffect, FormEvent } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RFP } from "interfaces";

const BrowseRFPsPage: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/rfp", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to fetch RFPs");
        setRfps(json.rfps ?? []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmitResponse = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRfp || !file) return;
    setSubmitting(true);
    try {
      // upload file
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/response-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error || "Upload failed");

      // submit response
      const resp = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          rfp: selectedRfp._id,
          file: upJson.filePath,
        }),
      });
      const respJson = await resp.json();
      if (!resp.ok) throw new Error(respJson.error || "Submission failed");

      setSelectedRfp(null);
      setFile(null);
      alert("Response submitted!");
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
            {rfps.map((rfp) => (
              <Card key={rfp._id}>
                <div className="flex justify-between items-start">
                  <div className="w-2/3">
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
                        Download Spec (v{rfp.versions[0].version})
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={rfp.status} />
                    {rfp.status === "Published" && (
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

        {selectedRfp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Submit Response to: {selectedRfp.title}
              </h3>
              <form onSubmit={handleSubmitResponse}>
                <input
                  type="file"
                  className="w-full border p-2 rounded mb-4"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Response"}
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
};

const BrowseRFPs: React.FC = () => (
  <ProtectedRoute allowedRoles={["Supplier"]}>
    <BrowseRFPsPage />
  </ProtectedRoute>
);

export default BrowseRFPs;
