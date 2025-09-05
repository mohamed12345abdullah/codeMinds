"use client";


import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";

interface FormDataState {
  title: string;
  date: string; // yyyy-mm-dd or ISO date string
  description: string;
  objectives: string[];
  videos: string[];
}

export default function AddLecturePage({ groupId, onSuccess }: { groupId: string; onSuccess?: () => void }) {
  const router = useRouter();
    

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    date: "",
    description: "",
    objectives: [""],
    videos: [""],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (name: keyof FormDataState, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateArrayItem = (
    key: "objectives" | "videos",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const copy = [...prev[key]];
      copy[index] = value;
      return { ...prev, [key]: copy } as FormDataState;
    });
  };

  const addArrayItem = (key: "objectives" | "videos") => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeArrayItem = (key: "objectives" | "videos", index: number) => {
    setFormData((prev) => {
      const copy = [...prev[key]];
      copy.splice(index, 1);
      return { ...prev, [key]: copy } as FormDataState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!groupId) {
      setError("Missing groupId in URL (use ?groupId=GROUP_ID)");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setSaving(true);
      const token = window.localStorage.getItem("token");

      // If your API differs, adjust endpoint accordingly, e.g. `/groups/${groupId}/lectures`
      const endpoint = `${baseUrl}/groups/addLecToGroup`;
      const payload = {
        groupId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : null,
        objectives: formData.objectives.filter((s) => s.trim().length > 0),
        videos: formData.videos.filter((s) => s.trim().length > 0),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Failed to add lecture");
      }
      setSuccess("✅ Lecture created successfully");
      // If parent provided a success handler (e.g., to refresh list), call it; otherwise redirect
      if (onSuccess) {
        onSuccess();
        // Reset form for convenience when staying on page
        setFormData({ title: "", date: "", description: "", objectives: [""], videos: [""] });
      } else {
        router.push(`/instructorDashboard/groupDetails?id=${groupId}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Add Lecture</h1>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>Create a new lecture for this group.</p>

      {!groupId && (
        <div style={{ padding: 10, border: "1px solid #725", borderRadius: 8, color: "#fca5a5", background: "#450a0a", marginBottom: 12 }}>
          ⚠️ Missing groupId. Open with ?groupId=GROUP_ID
        </div>
      )}
      {error && (
        <div style={{ padding: 10, border: "1px solid #92400e", borderRadius: 8, color: "#fed7aa", background: "#451a03", marginBottom: 12 }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: 10, border: "1px solid #134e4a", borderRadius: 8, color: "#bbf7d0", background: "#052e2b", marginBottom: 12 }}>{success}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Lecture title"
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Date</span>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            placeholder="Optional description"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
          />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>Objectives</div>
          {formData.objectives.map((obj, idx) => (
            <div key={`obj-${idx}`} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={obj}
                onChange={(e) => updateArrayItem("objectives", idx, e.target.value)}
                placeholder={`Objective #${idx + 1}`}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
              />
              <button type="button" onClick={() => removeArrayItem("objectives", idx)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9" }}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("objectives")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", width: "fit-content" }}>
            + Add Objective
          </button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>Videos</div>
          {formData.videos.map((v, idx) => (
            <div key={`vid-${idx}`} style={{ display: "flex", gap: 8 }}>
              <input
                type="url"
                value={v}
                onChange={(e) => updateArrayItem("videos", idx, e.target.value)}
                placeholder="https://..."
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}
              />
              <button type="button" onClick={() => removeArrayItem("videos", idx)} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9" }}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("videos")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", width: "fit-content" }}>
            + Add Video URL
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9" }}>
            Back
          </button>
          <button type="submit" disabled={saving} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid transparent", background: saving ? "#475569" : "#3b82f6", color: "#fff" }}>
            {saving ? "Saving..." : "Create Lecture"}
          </button>
        </div>
      </form>
    </div>
  );
}