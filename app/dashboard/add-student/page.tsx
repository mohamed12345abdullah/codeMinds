'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import NavbarPage from '../../components/Navbar';
import styles from './add-student.module.css';

const BASE_URL = 'https://code-minds-website.vercel.app/api';
// const BASE_URL = 'http://localhost:4000/api';

/* ─── Types ─────────────────────────────────────────────────────── */

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Group {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  availableSeats: number;
  totalSeats: number;
  instructor: Instructor;
  course: Course;
  students: unknown[];
  lectures: unknown[];
}

type Status = 'success' | 'error' | 'warning';
type Gender = 'male' | 'female';

interface Toast {
  id: number;
  message: string;
  status: Status;
}

/* ─── Components ────────────────────────────────────────────────── */

const Icon = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  UserPlus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Seat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  ),
  Spinner: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinner}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  ),
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className={styles.toastContainer} role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[`toast_${toast.status}`]}`}
          role="status"
        >
          <span className={styles.toastIcon}>
            {toast.status === 'success' ? <Icon.Check /> : <Icon.Alert />}
          </span>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button
            className={styles.toastClose}
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */

export default function AddStudentPage() {
  const [token, setToken] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Form: Register
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Form: Add to Group
  const [selectedGroup, setSelectedGroup] = useState('');
  const [addToGroupPhone, setAddToGroupPhone] = useState('');
  const [addToGroupLoading, setAddToGroupLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // UI
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Derived
  const selectedGroupDetails = useMemo(
    () => groups.find((g) => g._id === selectedGroup) || null,
    [groups, selectedGroup]
  );

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.course.title.toLowerCase().includes(term) ||
        g.instructor.name.toLowerCase().includes(term)
    );
  }, [groups, searchTerm]);

  /* ─── Effects ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('token') || '';
    setToken(t);
    if (t) fetchGroups(t);
  }, []);

  /* ─── Notifications ───────────────────────────────────────────── */

  const notify = useCallback((message: string, status: Status) => {
    const id = ++toastIdRef.current;
    const toast: Toast = { id, message, status };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ─── API ─────────────────────────────────────────────────────── */

  const fetchGroups = useCallback(async (authToken: string) => {
    setGroupsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/groups/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGroups(data.data || []);
      } else {
        notify(data.message || 'Failed to load groups', 'error');
      }
    } catch {
      notify('Network error while loading groups', 'error');
    } finally {
      setGroupsLoading(false);
    }
  }, [notify]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      notify('Authentication token not found', 'error');
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register/phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, password, age, gender }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success === true || data.success === undefined)) {
        notify(data.message || 'Student registered successfully', 'success');
        setName('');
        setPhone('');
        setPassword('');
        setAge('');
        setGender('male');
      } else {
        notify(data.message || 'Registration failed', 'error');
      }
    } catch {
      notify('Network error during registration', 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleAddToGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      notify('Authentication token not found', 'error');
      return;
    }
    if (!selectedGroup || !addToGroupPhone) {
      notify('Please select a group and enter a phone number', 'warning');
      return;
    }
    setAddToGroupLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/groups/manage/addStudent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: addToGroupPhone, groupId: selectedGroup }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify(data.message || 'Student added to group successfully', 'success');
        setAddToGroupPhone('');
        setSelectedGroup('');
        fetchGroups(token);
      } else {
        notify(data.message || 'Failed to add student to group', 'error');
      }
    } catch {
      notify('Network error while adding student', 'error');
    } finally {
      setAddToGroupLoading(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────── */

  return (
    <>
      <NavbarPage />

      <main className={styles.page}>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        <header className={styles.pageHeader}>
          <h1>Add New Student</h1>
          <p>Register a student and assign them to a course group</p>
        </header>

        <div className={styles.grid}>
          {/* ─── Register Form ────────────────────────────────────── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><Icon.UserPlus /></span>
              <div>
                <h2>Register New Student</h2>
                <p>Create a new student account via phone number</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className={styles.form} noValidate>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. Ahmed Mohamed"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="reg-phone">Phone Number</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. +20 10x xxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="reg-age">Age</label>
                  <input
                    id="reg-age"
                    type="number"
                    placeholder="e.g. 18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min={5}
                    max={100}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="reg-gender">Gender</label>
                <select
                  id="reg-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className={styles.btnPrimary}
              >
                {registerLoading ? (
                  <>
                    <Icon.Spinner /> Submitting…
                  </>
                ) : (
                  <>
                    <Icon.UserPlus /> Add Student
                  </>
                )}
              </button>
            </form>
          </section>

          {/* ─── Add to Group Form ────────────────────────────────── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><Icon.Users /></span>
              <div>
                <h2>Assign to Group</h2>
                <p>Add an existing student to a course group</p>
              </div>
            </div>

            <form onSubmit={handleAddToGroup} className={styles.form} noValidate>
              <div className={styles.field}>
                <label htmlFor="group-search">Search Groups</label>
                <div className={styles.searchWrapper}>
                  <span className={styles.searchIcon}><Icon.Search /></span>
                  <input
                    id="group-search"
                    type="search"
                    placeholder="Search by group, course, or instructor…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="group-select">Select Group</label>
                <div className={styles.selectWrapper}>
                  <select
                    id="group-select"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    required
                    disabled={groupsLoading}
                    aria-describedby="group-help"
                  >
                    <option value="">
                      {groupsLoading ? 'Loading groups…' : '— Choose a group —'}
                    </option>
                    {filteredGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.title} • {group.course.title} ({group.availableSeats}/{group.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                  {groupsLoading && <span className={styles.selectSpinner}><Icon.Spinner /></span>}
                </div>
                <span id="group-help" className={styles.fieldHelp}>
                  {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} available
                </span>
              </div>

              {/* Group Details Panel */}
              {selectedGroupDetails && (
                <div className={styles.detailsPanel} aria-live="polite">
                  <h3>Group Details</h3>
                  <dl className={styles.detailsList}>
                    <div>
                      <dt><Icon.Book /> Course</dt>
                      <dd>{selectedGroupDetails.course.title}</dd>
                    </div>
                    <div>
                      <dt><Icon.UserPlus /> Instructor</dt>
                      <dd>{selectedGroupDetails.instructor.name}</dd>
                    </div>
                    <div>
                      <dt><Icon.Mail /> Email</dt>
                      <dd>{selectedGroupDetails.instructor.email}</dd>
                    </div>
                    <div>
                      <dt><Icon.Phone /> Phone</dt>
                      <dd>{selectedGroupDetails.instructor.phone}</dd>
                    </div>
                    <div>
                      <dt><Icon.Calendar /> Duration</dt>
                      <dd>
                        {new Date(selectedGroupDetails.startDate).toLocaleDateString()} —{' '}
                        {new Date(selectedGroupDetails.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt><Icon.Seat /> Capacity</dt>
                      <dd>
                        <span className={styles.seatBadge}>
                          {selectedGroupDetails.availableSeats} / {selectedGroupDetails.totalSeats} seats left
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="student-phone">Student Phone Number</label>
                <input
                  id="student-phone"
                  type="tel"
                  placeholder="Enter the student's registered phone"
                  value={addToGroupPhone}
                  onChange={(e) => setAddToGroupPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>

              <button
                type="submit"
                disabled={addToGroupLoading || !selectedGroup}
                className={styles.btnSecondary}
              >
                {addToGroupLoading ? (
                  <>
                    <Icon.Spinner /> Adding…
                  </>
                ) : (
                  <>
                    <Icon.Users /> Add to Group
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}