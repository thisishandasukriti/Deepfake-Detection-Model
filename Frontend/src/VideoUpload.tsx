import { useState } from "react";
import { CircularProgress } from "@mui/material";

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ label: string; confidence: number } | null>(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a video");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error uploading video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Deepfake Detection 🎥</h2>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: 20 }}
      />

      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: 5,
          backgroundColor: "#8b5cf6",
          color: "#fff",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Upload & Predict"}
      </button>

      {result && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 10,
            backgroundColor: "rgba(0,0,0,0.05)",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: 10 }}>
            Result:{" "}
            <span style={{ color: result.label === "FAKE" ? "#f87171" : "#34d399", fontWeight: 600 }}>
              {result.label}
            </span>{" "}
            <span style={{ color: "#000", fontSize: "0.9rem", opacity: 0.7 }}>
              (Confidence: {(result.confidence * 100).toFixed(2)}%)
            </span>
          </h3>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
