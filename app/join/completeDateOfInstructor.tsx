"use client";

import { useState } from "react";

interface StudentFormData {
  age: number;
  gender: string;
}

interface CompleteDateOfInstructorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
}

// Prefer to keep baseUrl aligned with app usage. Adjust if you need localhost during development.
const baseUrl = "https://code-minds-website.vercel.app/api";

export default function CompleteDateOfInstructor({ isOpen, onClose, onSubmit }: CompleteDateOfInstructorProps) {
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [errors, setErrors] = useState<{ age?: string; gender?: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const e: { age?: string; gender?: string } = {};
    const n = parseInt(age);
    if (!age) e.age = "Age is required";
    else if (isNaN(n)) e.age = "Age must be a number";
    else if (n < 5 || n > 50) e.age = "Age must be between 5 and 50";
    if (!gender) e.gender = "Gender is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate()) return;
    setServerError(null);
    try {
      setSubmitting(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const res = await fetch(`${baseUrl}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ age: parseInt(age), gender }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to submit student info');
      }
      // notify parent after successful POST
      onSubmit({ age: parseInt(age), gender });
    } catch (e: any) {
      setServerError(e?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(2, 6, 23, 0.6)",
      backdropFilter: "blur(4px)",
      WebkitBackdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }}>
      <div style={{
        background: "var(--card-bg)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        width: "min(560px, 96vw)",
        padding: 20,
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Complete your profile</h3>
          <button onClick={onClose} aria-label="Close"
            style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 22, color: "var(--text-light)" }}>×</button>
        </div>
        {serverError && (
          <div style={{
            marginBottom: 10,
            padding: 10,
            borderRadius: 10,
            border: '1px solid #92400e',
            background: '#451a03',
            color: '#fed7aa',
            fontSize: 14,
          }}>{serverError}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-light)" }}>Age</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={5}
              max={50}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "#0b1220", color: "var(--text)" }}
            />
            {errors.age && <span style={{ color: "#fca5a5", fontSize: 12 }}>{errors.age}</span>}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-light)" }}>Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "#0b1220", color: "var(--text)" }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <span style={{ color: "#fca5a5", fontSize: 12 }}>{errors.gender}</span>}
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={submitting}
              style={{ padding: "10px 14px", borderRadius: 10, background: "#0f172a", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting}
              style={{ padding: "10px 14px", borderRadius: 10, background: submitting ? "#475569" : "var(--primary)", color: "#fff", border: "1px solid transparent", cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? 'Submitting...' : 'Continue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}







