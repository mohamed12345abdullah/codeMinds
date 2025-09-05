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
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff",
        color: "#111827",
        borderRadius: 12,
        width: "min(520px, 92vw)",
        padding: 20,
        boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Complete Your Profile</h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        {serverError && (
          <div style={{
            marginBottom: 8,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #92400e',
            background: '#fff7ed',
            color: '#9a3412',
            fontSize: 14,
          }}>{serverError}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, color: "#374151" }}>Age</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={5}
              max={50}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #D1D5DB" }}
            />
            {errors.age && <span style={{ color: "#DC2626", fontSize: 12 }}>{errors.age}</span>}
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14, color: "#374151" }}>Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #D1D5DB" }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <span style={{ color: "#DC2626", fontSize: 12 }}>{errors.gender}</span>}
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "8px 12px", borderRadius: 8, background: "#F3F4F6", border: "1px solid #E5E7EB", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 12px", borderRadius: 8, background: submitting ? "#9ca3af" : "#4F46E5", color: "#fff", border: "1px solid transparent", cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? 'Submitting...' : 'Continue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}







