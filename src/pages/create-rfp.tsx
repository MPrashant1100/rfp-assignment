import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";

const CreateRFPPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return setError("File is required");
    setLoading(true);
    setError("");
    try {
      // 1) Upload file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/rfp-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(uploadJson.error || "File upload failed");

      // 2) Create RFP record
      const createRes = await fetch("/api/rfp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          file: uploadJson.filePath,
        }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok)
        throw new Error(createJson.error || "RFP creation failed");

      router.push("/my-rfps");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Create RFP</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="file"
            className="w-full border p-2 rounded"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Create RFP"}
          </button>
        </form>
      </Card>
    </div>
  );
};

const CreateRFP: React.FC = () => (
  <ProtectedRoute allowedRoles={["Buyer"]}>
    <CreateRFPPage />
  </ProtectedRoute>
);

export default CreateRFP;
