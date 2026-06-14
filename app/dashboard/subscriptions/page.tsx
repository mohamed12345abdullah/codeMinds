"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { Pencil, Trash2, Plus, Search, X, Package, ChevronUp, ChevronDown, ChevronsUpDown, BarChart2, Clock, DollarSign } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Course {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface Package {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  price: number;
  sessionPerMonth: number;
  numberOfMonths: number;
  numberOfSessions: number;
}

type SortKey = "title" | "price" | "sessionPerMonth" | "numberOfMonths" | "numberOfSessions";
type SortDir = "asc" | "desc" | null;

// ============================================================================
// API Configuration
// ============================================================================

// const API_URL = "http://localhost:4000/api";

const API_URL = "https://code-minds-website.vercel.app/api";
const fetchWithAuth = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
 
  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed (${response.status})`);
  }

  const json = await response.json();
  return json.data;
};

// ============================================================================
// Validation Schema
// ============================================================================

const packageFormSchema = z.object({
  courseId: z.string().min(1, "الدورة مطلوبة"),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من 0"),
  sessionPerMonth: z.coerce.number().int().positive("عدد الجلسات الشهرية يجب أن يكون أكبر من 0"),
  numberOfMonths: z.coerce.number().int().positive("عدد الأشهر يجب أن يكون أكبر من 0"),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

// ============================================================================
// CSS Styles
// ============================================================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --primary-light: #eff6ff;
    --danger: #ef4444;
    --danger-light: #fef2f2;
    --success: #10b981;
    --warning: #f59e0b;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --border: #e2e8f0;
    --border-light: #f1f5f9;
    --bg: #f0f4f8;
    --bg-card: #ffffff;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
    --shadow-lg: 0 20px 40px rgba(0,0,0,0.12);
    --radius: 1rem;
    --radius-sm: 0.5rem;
    --radius-xs: 0.375rem;
  }

  body {
    background: var(--bg);
    font-family: 'Cairo', system-ui, sans-serif;
    color: var(--text-primary);
    direction: rtl;
  }

  /* ── Layout ── */
  .dashboard {
    min-height: 100vh;
    padding: 2rem 1.5rem;
  }
  .dashboard-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ── Page Header ── */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .page-header-text h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .page-header-text p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  /* ── Stats Bar ── */
  .stats-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .stat-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
  }
  .stat-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .stat-icon.blue   { background: #eff6ff; color: #2563eb; }
  .stat-icon.green  { background: #ecfdf5; color: #059669; }
  .stat-icon.amber  { background: #fffbeb; color: #d97706; }
  .stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.1;
    margin-top: 0.125rem;
  }

  /* ── Card ── */
  .card {
    background: var(--bg-card);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-light);
    overflow: hidden;
  }
  .card-toolbar {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .card-body {
    padding: 1.5rem;
  }

  /* ── Search ── */
  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
  }
  .search-icon-left {
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 0.625rem 2.5rem 0.625rem 2.5rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    background: #f8fafc;
    font-size: 0.875rem;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
    transition: all 0.2s;
  }
  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  .search-clear {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    display: flex;
    padding: 0.125rem;
    border-radius: 50%;
    transition: all 0.15s;
  }
  .search-clear:hover { color: var(--text-primary); background: var(--border-light); }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.625rem 1.125rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Cairo', sans-serif;
    cursor: pointer;
    transition: all 0.18s ease;
    border: none;
    white-space: nowrap;
    text-decoration: none;
  }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; pointer-events: none; }
  .btn-primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 2px 8px rgba(37,99,235,0.25);
  }
  .btn-primary:hover {
    background: var(--primary-dark);
    box-shadow: 0 4px 14px rgba(37,99,235,0.35);
    transform: translateY(-1px);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-outline {
    background: white;
    border: 1.5px solid var(--border);
    color: var(--text-secondary);
  }
  .btn-outline:hover { border-color: #94a3b8; background: #f8fafc; }
  .btn-destructive {
    background: var(--danger);
    color: white;
    box-shadow: 0 2px 8px rgba(239,68,68,0.2);
  }
  .btn-destructive:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }

  /* ── Table ── */
  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .data-table th {
    text-align: right;
    padding: 0.875rem 1.25rem;
    background: #f8fafc;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    user-select: none;
  }
  .data-table th.sortable { cursor: pointer; }
  .data-table th.sortable:hover { color: var(--primary); background: #f0f6ff; }
  .th-inner {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .data-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-light);
    color: var(--text-primary);
    vertical-align: middle;
  }
  .data-table tbody tr:last-child td { border-bottom: none; }
  .data-table tbody tr {
    transition: background 0.15s;
  }
  .data-table tbody tr:hover td { background: #f8faff; }

  /* Course name cell */
  .course-cell {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }
  .course-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    flex-shrink: 0;
  }
  .course-title { font-weight: 600; }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .badge-blue { background: #dbeafe; color: #1d4ed8; }
  .badge-green { background: #d1fae5; color: #065f46; }

  /* Price cell */
  .price-cell { font-weight: 700; color: var(--text-primary); }
  .price-unit { font-size: 0.7rem; color: var(--text-muted); font-weight: 500; margin-right: 2px; }

  /* Action buttons */
  .action-buttons { display: flex; gap: 0.375rem; }
  .action-btn {
    padding: 0.4rem;
    border-radius: var(--radius-xs);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    display: inline-flex;
    line-height: 1;
  }
  .action-btn.edit   { color: var(--primary); }
  .action-btn.edit:hover   { background: var(--primary-light); }
  .action-btn.delete { color: var(--danger); }
  .action-btn.delete:hover { background: var(--danger-light); }

  /* ── Empty State ── */
  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-muted);
  }
  .empty-icon-wrap {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: #94a3b8;
  }
  .empty-state h3 { font-size: 1rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem; }
  .empty-state p  { font-size: 0.875rem; margin-bottom: 1.25rem; }

  /* ── Skeleton ── */
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 0.375rem;
    height: 0.875rem;
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.55);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-content {
    background: white;
    border-radius: 1.25rem;
    max-width: 28rem;
    width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: slideUp 0.22s ease;
  }
  @keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-light);
  }
  .modal-header h2 { font-size: 1.125rem; font-weight: 700; }
  .modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    padding: 0.25rem;
    border-radius: var(--radius-xs);
    display: flex;
    transition: all 0.15s;
  }
  .modal-close:hover { color: var(--text-primary); background: var(--border-light); }
  .modal-body { padding: 1.5rem; }

  /* ── Form ── */
  .form-group { margin-bottom: 1.125rem; }
  .form-label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.375rem;
  }
  .form-input, .form-select {
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-xs);
    font-size: 0.875rem;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
    background: white;
    transition: all 0.2s;
    direction: rtl;
  }
  .form-input:focus, .form-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
  }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
  .error-msg { color: var(--danger); font-size: 0.75rem; margin-top: 0.25rem; font-weight: 500; }

  .total-preview {
    background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%);
    border: 1px solid #dbeafe;
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
    margin: 1.25rem 0;
  }
  .total-label { font-size: 0.8125rem; color: var(--text-secondary); font-weight: 600; }
  .total-number { font-size: 2.25rem; font-weight: 800; color: #1e40af; line-height: 1.1; }
  .total-sub { font-size: 0.75rem; color: #60a5fa; margin-top: 0.125rem; }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-light);
  }

  /* ── Alert Dialog ── */
  .alert-icon-wrap {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--danger-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--danger);
  }

  /* ── Error Screen ── */
  .error-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .error-card {
    background: white;
    border-radius: var(--radius);
    padding: 2.5rem;
    text-align: center;
    box-shadow: var(--shadow-md);
    max-width: 380px;
    width: 100%;
  }
  .error-card h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); }
  .error-card p  { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; }

  /* ── Result count ── */
  .result-count {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-weight: 500;
    white-space: nowrap;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .stats-bar { grid-template-columns: 1fr; }
    .page-header { flex-direction: column; align-items: flex-start; }
    .data-table th, .data-table td { padding: 0.75rem 0.875rem; }
    .form-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .dashboard { padding: 1rem; }
  }
`;

// ============================================================================
// UI Components
// ============================================================================

const GlobalStyles = () => <style dangerouslySetInnerHTML={{ __html: styles }} />;

function Button({ children, onClick, variant = "primary", disabled = false, className = "", type = "button" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "destructive";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

function FormInput({ label, error, ...props }: any) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input className="form-input" {...props} />
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, error, placeholder = "اختر..." }: any) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>{placeholder}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function AlertDialog({ open, onClose, title, description, onConfirm, isDeleting }: any) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "22rem" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ padding: "2rem", textAlign: "center" }}>
          <div className="alert-icon-wrap">
            <Trash2 size={22} />
          </div>
          <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", marginBottom: "0.5rem" }}>{title}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>{description}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? "جاري الحذف..." : "حذف الباقة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== column) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
  return sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {[120, 70, 60, 60, 60, 50].map((w, j) => (
            <td key={j} style={{ padding: "1rem 1.25rem" }}>
              <div className="skeleton" style={{ width: `${w}px` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ============================================================================
// Package Form Dialog
// ============================================================================

function PackageFormDialog({ open, onClose, initialData, courses, onSubmit, isSubmitting }: {
  open: boolean;
  onClose: () => void;
  initialData: Package | null;
  courses: Course[];
  onSubmit: (data: PackageFormValues) => void;
  isSubmitting: boolean;
}) {
  const defaultValues: PackageFormValues = { courseId: "", price: 0, sessionPerMonth: 1, numberOfMonths: 1 };
  const [formData, setFormData] = useState<PackageFormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof PackageFormValues, string>>>({});

  useEffect(() => {
    if (open) {
      setFormData(
        initialData
          ? {
              courseId: initialData.course._id,
              price: initialData.price,
              sessionPerMonth: initialData.sessionPerMonth,
              numberOfMonths: initialData.numberOfMonths,
            }
          : defaultValues
      );
      setErrors({});
    }
  }, [open, initialData]);

  // Keep a ref in sync so validate() always reads the latest values
  // regardless of React's batched state updates between renders.
  const formDataRef = useRef<PackageFormValues>(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const setField = useCallback(<K extends keyof PackageFormValues>(field: K, value: PackageFormValues[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = (current: PackageFormValues): boolean => {
    const result = packageFormSchema.safeParse(current);
    if (result.success) { setErrors({}); return true; }
    const newErrors: Partial<Record<keyof PackageFormValues, string>> = {};
    // Guard: result.error may be undefined in some Zod edge cases
    const issues = result.error?.errors ?? result.error?.issues ?? [];
    issues.forEach((err: any) => {
      const key = err.path[0] as keyof PackageFormValues;
      if (!newErrors[key]) newErrors[key] = err.message;
    });
    setErrors(newErrors);
    return false;
  };

  const handleSubmit = () => {
    // Read from ref so we always validate the latest state even if
    // React hasn't flushed the last setState before this click fires.
    const current = formDataRef.current;
    if (validate(current)) onSubmit(current);
  };

  const totalSessions = (Number(formData.sessionPerMonth) || 0) * (Number(formData.numberOfMonths) || 0);

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "تعديل الباقة" : "إضافة باقة جديدة"}>
      <FormSelect
        label="الدورة التعليمية"
        value={formData.courseId}
        onChange={(val: string) => setField("courseId", val)}
        options={courses.map((c) => ({ value: c._id, label: c.title }))}
        error={errors.courseId}
        placeholder="اختر الدورة..."
      />
      <FormInput
        label="السعر (ريال)"
        type="number"
        step="0.01"
        min="0"
        value={formData.price || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("price", e.target.valueAsNumber)}
        error={errors.price}
        placeholder="0.00"
      />
      <div className="form-row">
        <FormInput
          label="الجلسات شهرياً"
          type="number"
          min="1"
          value={formData.sessionPerMonth || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("sessionPerMonth", e.target.valueAsNumber)}
          error={errors.sessionPerMonth}
          placeholder="1"
        />
        <FormInput
          label="عدد الأشهر"
          type="number"
          min="1"
          value={formData.numberOfMonths || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField("numberOfMonths", e.target.valueAsNumber)}
          error={errors.numberOfMonths}
          placeholder="1"
        />
      </div>
      <div className="total-preview">
        <div className="total-label">إجمالي الجلسات</div>
        <div className="total-number">{totalSessions}</div>
        <div className="total-sub">
          {formData.sessionPerMonth} جلسة × {formData.numberOfMonths} شهر
        </div>
      </div>
      <div className="form-actions">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button variant="primary" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? "جاري الحفظ..." : initialData ? "حفظ التعديلات" : "إضافة الباقة"}
        </Button>
      </div>
    </Modal>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function PackagesDashboard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [packagesData, coursesData] = await Promise.all([
        fetchWithAuth<Package[]>("/packages"),
        fetchWithAuth<Course[]>("/courses"),
      ]);
      setPackages(packagesData);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في تحميل البيانات");
      toast.error("فشل تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD Handlers ──────────────────────────────────────────────────────────

  const handleCreate = async (data: PackageFormValues) => {
    setIsSubmitting(true);
    try {
      const newPkg = await fetchWithAuth<Package>("/packages", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setPackages((prev) => [newPkg, ...prev]);
      toast.success("✅ تم إضافة الباقة بنجاح");
      closeForm();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إضافة الباقة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: PackageFormValues) => {
    setIsSubmitting(true);
    try {
      const updated = await fetchWithAuth<any>(`/packages/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // The API may return course as a bare ID string or a partial object.
      // Use the already-fetched courses list as the source of truth so the
      // UI always gets the full { _id, title } shape.
      const resolvedCourse = courses.find((c) => c._id === data.courseId) ?? {
        _id: data.courseId,
        title: updated?.course?.title ?? updated?.course ?? data.courseId,
      };

      const merged: Package = {
        _id: id,
        course: { _id: resolvedCourse._id, title: resolvedCourse.title },
        price: updated?.price ?? data.price,
        sessionPerMonth: updated?.sessionPerMonth ?? data.sessionPerMonth,
        numberOfMonths: updated?.numberOfMonths ?? data.numberOfMonths,
        numberOfSessions:
          updated?.numberOfSessions ?? data.sessionPerMonth * data.numberOfMonths,
      };

      setPackages((prev) => prev.map((pkg) => (pkg._id === id ? merged : pkg)));
      toast.success("✅ تم تحديث الباقة بنجاح");
      closeForm();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تحديث الباقة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await fetchWithAuth(`/packages/${id}`, { method: "DELETE" });
      setPackages((prev) => prev.filter((pkg) => pkg._id !== id));
      toast.success("🗑️ تم حذف الباقة بنجاح");
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء حذف الباقة");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Dialog Helpers ─────────────────────────────────────────────────────────

  const openAdd = () => { setEditingPackage(null); setIsFormOpen(true); };
  const openEdit = (pkg: Package) => { setEditingPackage(pkg); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingPackage(null); };

  const openDeleteConfirm = (pkg: Package) => { setPackageToDelete(pkg); setDeleteDialogOpen(true); };
  const closeDelete = () => { setDeleteDialogOpen(false); setPackageToDelete(null); };

  const handleFormSubmit = (values: PackageFormValues) => {
    if (editingPackage) handleUpdate(editingPackage._id, values);
    else handleCreate(values);
  };

  // ── Sorting ────────────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
  };

  // ── Filtering + Sorting ────────────────────────────────────────────────────

  const processedPackages = useMemo(() => {
    let result = packages;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((pkg) => pkg.course.title.toLowerCase().includes(term));
    }

    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        let av: any, bv: any;
        if (sortKey === "title") { av = a.course.title; bv = b.course.title; }
        else { av = a[sortKey]; bv = b[sortKey]; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [packages, searchTerm, sortKey, sortDir]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalSessions = packages.reduce((s, p) => s + p.numberOfSessions, 0);
    const avgPrice = packages.length
      ? packages.reduce((s, p) => s + p.price, 0) / packages.length
      : 0;
    return { total: packages.length, totalSessions, avgPrice };
  }, [packages]);

  // ── Error Screen ───────────────────────────────────────────────────────────

  if (error && !isLoading) {
    return (
      <>
        <GlobalStyles />
        <div className="error-screen" dir="rtl">
          <div className="error-card">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⚠️</div>
            <h2>تعذّر تحميل البيانات</h2>
            <p>{error}</p>
            <Button onClick={fetchData}>إعادة المحاولة</Button>
          </div>
        </div>
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <GlobalStyles />
      <div className="dashboard" dir="rtl">
        <div className="dashboard-inner">

          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-text">
              <h1>إدارة الباقات التعليمية</h1>
              <p>تنظيم ومتابعة باقات الدورات لجميع المراحل</p>
            </div>
            <Button variant="primary" onClick={openAdd}>
              <Plus size={17} />
              إضافة باقة جديدة
            </Button>
          </div>

          {/* Stats Bar */}
          {!isLoading && (
            <div className="stats-bar">
              <div className="stat-card">
                <div className="stat-icon blue"><Package size={20} /></div>
                <div>
                  <div className="stat-label">إجمالي الباقات</div>
                  <div className="stat-value">{stats.total}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><Clock size={20} /></div>
                <div>
                  <div className="stat-label">إجمالي الجلسات</div>
                  <div className="stat-value">{stats.totalSessions.toLocaleString("ar-EG")}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber"><DollarSign size={20} /></div>
                <div>
                  <div className="stat-label">متوسط السعر</div>
                  <div className="stat-value">
                    {stats.avgPrice.toLocaleString("ar-EG", { maximumFractionDigits: 0 })}
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500, marginRight: "4px" }}>ر.س</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Card */}
          <div className="card">
            {/* Toolbar */}
            <div className="card-toolbar">
              <div className="search-wrapper">
                <Search className="search-icon-left" size={16} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="البحث باسم الدورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="search-clear" onClick={() => setSearchTerm("")}>
                    <X size={14} />
                  </button>
                )}
              </div>
              {!isLoading && (
                <span className="result-count">
                  {processedPackages.length} من {packages.length} باقة
                </span>
              )}
            </div>

            {/* Table */}
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort("title")}>
                        <span className="th-inner">
                          اسم الدورة
                          <SortIcon column="title" sortKey={sortKey} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className="sortable" onClick={() => handleSort("price")}>
                        <span className="th-inner">
                          السعر
                          <SortIcon column="price" sortKey={sortKey} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className="sortable" onClick={() => handleSort("sessionPerMonth")}>
                        <span className="th-inner">
                          جلسات / شهر
                          <SortIcon column="sessionPerMonth" sortKey={sortKey} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className="sortable" onClick={() => handleSort("numberOfMonths")}>
                        <span className="th-inner">
                          الأشهر
                          <SortIcon column="numberOfMonths" sortKey={sortKey} sortDir={sortDir} />
                        </span>
                      </th>
                      <th className="sortable" onClick={() => handleSort("numberOfSessions")}>
                        <span className="th-inner">
                          إجمالي الجلسات
                          <SortIcon column="numberOfSessions" sortKey={sortKey} sortDir={sortDir} />
                        </span>
                      </th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>

                  {isLoading ? (
                    <TableSkeleton />
                  ) : processedPackages.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <div className="empty-icon-wrap">
                              <Package size={28} />
                            </div>
                            <h3>{searchTerm ? "لا توجد نتائج" : "لا توجد باقات بعد"}</h3>
                            <p>
                              {searchTerm
                                ? `لم يتم العثور على باقات تطابق "${searchTerm}"`
                                : "ابدأ بإضافة أول باقة تعليمية الآن"}
                            </p>
                            {!searchTerm && (
                              <Button variant="primary" onClick={openAdd}>
                                <Plus size={16} /> إضافة باقة
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {processedPackages.map((pkg) => (
                        <tr key={pkg._id}>
                          <td>
                            <div className="course-cell">
                              <div className="course-dot" />
                              <span className="course-title">{pkg.course.title}</span>
                            </div>
                          </td>
                          <td>
                            <span className="price-cell">
                              {pkg.price.toLocaleString("ar-EG")}
                              <span className="price-unit">ر.س</span>
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-blue">{pkg.sessionPerMonth} جلسة</span>
                          </td>
                          <td>{pkg.numberOfMonths} شهر</td>
                          <td>
                            <span className="badge badge-green">{pkg.numberOfSessions} جلسة</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn edit" onClick={() => openEdit(pkg)} title="تعديل">
                                <Pencil size={15} />
                              </button>
                              <button className="action-btn delete" onClick={() => openDeleteConfirm(pkg)} title="حذف">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PackageFormDialog
        open={isFormOpen}
        onClose={closeForm}
        initialData={editingPackage}
        courses={courses}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onClose={closeDelete}
        title="تأكيد الحذف"
        description={`هل أنت متأكد من حذف الباقة الخاصة بدورة "${packageToDelete?.course.title ?? ""}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={() => packageToDelete && handleDelete(packageToDelete._id)}
        isDeleting={isDeleting}
      />

      <Toaster position="top-left" richColors />
    </>
  );
}