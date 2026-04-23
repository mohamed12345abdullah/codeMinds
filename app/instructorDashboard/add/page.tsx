"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FiUpload, FiPlus, FiX, FiArrowLeft, 
  FiCheckCircle, FiAlertCircle, FiVideo, FiTarget 
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

const baseUrl = "https://code-minds-website.vercel.app/api";

interface Group {
  _id: string;
  title: string;
  course: {
    _id: string;
    title: string;
  };
}

function AddLectureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    objectives: [""],
    videos: [] as string[],
  });

  const fetchGroup = useCallback(async () => {
    if (!groupId) {
      router.push("/dashboard/progress");
      return;
    }

    try {
      const token = window.localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/groups/${groupId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setGroup(result.data);
      } else {
        setError("Failed to load group details.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateObjective = (index: number, value: string) => {
    const newObjs = [...formData.objectives];
    newObjs[index] = value;
    setFormData((prev) => ({ ...prev, objectives: newObjs }));
  };

  const addObjective = () => setFormData((p) => ({ ...p, objectives: [...p.objectives, ""] }));

  const removeObjective = (index: number) => {
    setFormData((p) => ({
      ...p,
      objectives: p.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || isSaving) return;

    try {
      setIsSaving(true);
      setError(null);
      const token = window.localStorage.getItem("token");
      
      const payload = {
        groupId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : null,
        objectives: formData.objectives.filter((s) => s.trim()),
        videos: formData.videos.filter((s) => s.trim()),
      };

      const response = await fetch(`${baseUrl}/groups/addLecToGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        router.push(`/instructorDashboard/groupDetails?id=${groupId}`);
      } else {
        throw new Error(result.message || "Failed to create lecture");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f1f5f9" }}>
      <Navbar />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 20px 40px" }}>
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", color: "#3b82f6", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "24px", fontWeight: 500 }}
        >
          <FiArrowLeft /> Back to Group
        </button>

        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>Add New Lecture</h1>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>
            Group: <span style={{ color: "#fff" }}>{group?.title}</span> • {group?.course?.title}
          </p>
        </header>

        {error && (
          <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "12px", color: "#fca5a5", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }} className="glass-card">
          <div className="input-group">
            <label>Lecture Title</label>
            <input
              name="title"
              placeholder="e.g. Introduction to React Hooks"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="What will students learn in this session?"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiTarget /> Learning Objectives
            </label>
            {formData.objectives.map((obj, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px" }}>
                <input
                  style={{ flex: 1, padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                  value={obj}
                  placeholder={`Objective #${idx + 1}`}
                  onChange={(e) => updateObjective(idx, e.target.value)}
                />
                {formData.objectives.length > 1 && (
                  <button type="button" onClick={() => removeObjective(idx)} className="icon-btn-delete">
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addObjective} className="add-btn-small">
              <FiPlus /> Add Objective
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", borderTop: "1px solid #334155", paddingTop: "24px" }}>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
              {isSaving ? "Creating..." : <><FiCheckCircle /> Create Lecture</>}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .glass-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          padding: 32px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.9rem; font-weight: 600; color: #94a3b8; }
        .input-group input, .input-group textarea {
          padding: 12px 16px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .input-group input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        
        .btn-primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        
        .icon-btn-delete { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 8px; cursor: pointer; }
        .add-btn-small { background: transparent; color: #3b82f6; border: 1px dashed #3b82f6; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; width: fit-content; }
        
        .spinner { width: 40px; height: 40px; border: 4px solid #1e293b; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function AddLecturePage() {
  return (
    <Suspense fallback={<div style={{ background: "#0f172a", minHeight: "100vh" }} />}>
      <AddLectureContent />
    </Suspense>
  );
}
