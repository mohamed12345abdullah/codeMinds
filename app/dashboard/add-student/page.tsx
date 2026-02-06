 'use client';
 
 import { useState, useEffect } from 'react';
 import NavbarPage from '../../components/Navbar';
 import NotificationPage from '../../notification/page';
 import styles from '../dashboard.module.css';
 

 const baseUrl = "https://code-minds-website.vercel.app/api";
 // const baseUrl = "http://localhost:4000/api";

 type Status = 'success' | 'error' | 'warning';
 
 interface Group {
   _id: string;
   title: string;
   startDate: string;
   endDate: string;
   availableSeats: number;
   totalSeats: number;
   instructor: {
     _id: string;
     name: string;
     email: string;
     phone: string;
   };
   course: {
     _id: string;
     title: string;
   };
   students: any[];
   lectures: any[];
 }
 
 export default function AddStudentPage() {
   const [name, setName] = useState('');
   const [phone, setPhone] = useState('');
   const [password, setPassword] = useState('');
   const [age, setAge] = useState('');
   const [gender, setGender] = useState<'male' | 'female'>('male');
   const [token, setToken] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState<string | null>(null);
   const [status, setStatus] = useState<Status>('success');
   const [k, setK] = useState(0);
   const [groups, setGroups] = useState<Group[]>([]);
   const [selectedGroup, setSelectedGroup] = useState('');
   const [addToGroupPhone, setAddToGroupPhone] = useState('');
   const [addToGroupLoading, setAddToGroupLoading] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
   const [showGroupDetails, setShowGroupDetails] = useState(false);
   const [selectedGroupDetails, setSelectedGroupDetails] = useState<Group | null>(null);
 
   useEffect(() => {
     if (typeof window !== 'undefined') {
       const t = localStorage.getItem('token') || '';
       setToken(t);
       if (t) {
         fetchGroups(t);
       }
     }
   }, []);
 
   const fetchGroups = async (authToken: string) => {
     try {
       const res = await fetch(`${baseUrl}/groups/`, {
         method: 'GET',
         headers: {
           Authorization: `Bearer ${authToken}`,
         },
       });
       const data = await res.json();
       if (res.ok && data.success) {
         setGroups(data.data || []);
       }
     } catch (error) {
       console.error('Failed to fetch groups:', error);
     }
   };
 
   const submit = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     setMessage(null);
     try {
       if (!token) {
         setStatus('error');
         setMessage('Authentication token not found');
         setK((x) => x + 1);
         return;
       }
       const res = await fetch(`${baseUrl}/auth/register/phone`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
           name,
           phone,
           password,
           age,
           gender,
         }),
       });
       const data = await res.json().catch(() => ({}));
       if (res.ok && (data.success === true || data.success === undefined)) {
         setStatus('success');
         setMessage(data.message || 'Student registered successfully');
         setK((x) => x + 1);
         setName('');
         setPhone('');
         setPassword('');
         setAge('');
         setGender('male');
       } else {
         setStatus('error');
         setMessage(data.message || 'Registration failed');
         setK((x) => x + 1);
       }
     } catch {
       setStatus('error');
       setMessage('Network error');
       setK((x) => x + 1);
     } finally {
       setLoading(false);
     }
   };
 
   const filteredGroups = groups.filter(group =>
     group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const handleGroupSelect = (groupId: string) => {
     setSelectedGroup(groupId);
     const group = groups.find(g => g._id === groupId);
     if (group) {
       setSelectedGroupDetails(group);
       setShowGroupDetails(true);
     }
   };
 
   const addStudentToGroup = async (e: React.FormEvent) => {
     e.preventDefault();
     setAddToGroupLoading(true);
     setMessage(null);
     try {
       if (!token) {
         setStatus('error');
         setMessage('Authentication token not found');
         setK((x) => x + 1);
         return;
       }
       if (!selectedGroup || !addToGroupPhone) {
         setStatus('error');
         setMessage('Please select a group and enter phone number');
         setK((x) => x + 1);
         return;
       }
       const res = await fetch(`${baseUrl}/groups/manage/addStudent`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
           phone: addToGroupPhone,
           groupId: selectedGroup,
         }),
       });
       const data = await res.json();
       if (res.ok && data.success) {
         setStatus('success');
         setMessage(data.message || 'Student added to group successfully');
         setK((x) => x + 1);
         setAddToGroupPhone('');
         setSelectedGroup('');
         // Refresh groups to update available seats
         fetchGroups(token);
       } else {
         setStatus('error');
         setMessage(data.message || 'Failed to add student to group');
         setK((x) => x + 1);
       }
     } catch {
       setStatus('error');
       setMessage('Network error');
       setK((x) => x + 1);
     } finally {
       setAddToGroupLoading(false);
     }
   };
 
   return (
     <>
       <NavbarPage />
       <div className={styles.container}>
         <div className={styles.header}>
           <h1>إضافة طالب جديد</h1>
           <p>تسجيل طالب عبر رقم الهاتف</p>
         </div>
 
         {/* Register New Student Form */}
         <form onSubmit={submit} style={{ maxWidth: 520, margin: '0 auto 3rem' }}>
           <h3 style={{ marginBottom: '1rem', color: '#333' }}>تسجيل طالب جديد</h3>
           <div style={{ display: 'grid', gap: '1rem' }}>
             <input
               type="text"
               placeholder="Name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
               required
             />
             <input
               type="tel"
               placeholder="Phone"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
               required
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
               required
             />
             <input
               type="text"
               placeholder="Age"
               value={age}
               onChange={(e) => setAge(e.target.value)}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
               required
             />
             <select
               value={gender}
               onChange={(e) => setGender(e.target.value as 'male' | 'female')}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
             >
               <option value="male">Male</option>
               <option value="female">Female</option>
             </select>
             <button
               type="submit"
               disabled={loading}
               style={{
                 padding: '0.9rem',
                 borderRadius: 8,
                 border: 'none',
                 background: '#4CAF50',
                 color: '#fff',
                 fontWeight: 600,
                 cursor: loading ? 'not-allowed' : 'pointer',
               }}
             >
               {loading ? 'Submitting...' : 'Add Student'}
             </button>
           </div>
         </form>
 
         {/* Add Student to Group Form */}
         <form onSubmit={addStudentToGroup} style={{ maxWidth: 600, margin: '0 auto' }}>
           <h3 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>إضافة طالب إلى مجموعة</h3>
           
           {/* Search Input */}
           <div style={{ marginBottom: '1rem' }}>
             <input
               type="text"
               placeholder="🔍 ابحث باسم المجموعة، المادة، أو المحاضر"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               style={{ 
                 padding: '0.75rem', 
                 borderRadius: 8, 
                 border: '1px solid #ddd',
                 width: '100%',
                 marginBottom: '1rem'
               }}
             />
           </div>

           {/* Group Selection */}
           <div style={{ marginBottom: '1rem' }}>
             <select
               value={selectedGroup}
               onChange={(e) => handleGroupSelect(e.target.value)}
               style={{ 
                 padding: '0.75rem', 
                 borderRadius: 8, 
                 border: '1px solid #ddd',
                 width: '100%',
                 marginBottom: '1rem'
               }}
               required
             >
               <option value="">📚 اختر المجموعة</option>
               {filteredGroups.map((group) => (
                 <option key={group._id} value={group._id}>
                   {group.title} - {group.course.title} ({group.availableSeats}/{group.totalSeats} مقاعد)
                 </option>
               ))}
             </select>
           </div>

           {/* Group Details */}
           {showGroupDetails && selectedGroupDetails && (
             <div style={{
               background: '#333',
               padding: '1rem',
               borderRadius: '8px',
               border: '1px solid #e9ecef',
               marginBottom: '1rem',
               color: '#7faff6ff'
             }}>
               <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>تفاصيل المجموعة</h4>
               <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                 <p><strong>المادة:</strong> {selectedGroupDetails.course.title}</p>
                 <p><strong>المحاضر:</strong> {selectedGroupDetails.instructor.name}</p>
                 <p><strong>البريد الإلكتروني:</strong> {selectedGroupDetails.instructor.email}</p>
                 <p><strong>الهاتف:</strong> {selectedGroupDetails.instructor.phone}</p>
                 <p><strong>تاريخ البدء:</strong> {new Date(selectedGroupDetails.startDate).toLocaleDateString('ar-EG')}</p>
                 <p><strong>تاريخ الانتهاء:</strong> {new Date(selectedGroupDetails.endDate).toLocaleDateString('ar-EG')}</p>
                 <p><strong>المقاعد:</strong> {selectedGroupDetails.availableSeats}/{selectedGroupDetails.totalSeats} متاحة</p>
                 <p><strong>عدد الطلاب:</strong> {selectedGroupDetails.students?.length || 0}</p>
                 <p><strong>عدد المحاضرات:</strong> {selectedGroupDetails.lectures?.length || 0}</p>
               </div>
             </div>
           )}

           {/* Phone Input and Submit */}
           <div style={{ display: 'grid', gap: '1rem' }}>
             <input
               type="tel"
               placeholder="📱 رقم هاتف الطالب"
               value={addToGroupPhone}
               onChange={(e) => setAddToGroupPhone(e.target.value)}
               style={{ padding: '0.75rem', borderRadius: 8, border: '1px solid #ddd' }}
               required
             />
             <button
               type="submit"
               disabled={addToGroupLoading}
               style={{
                 padding: '0.9rem',
                 borderRadius: 8,
                 border: 'none',
                 background: '#2196F3',
                 color: '#fff',
                 fontWeight: 600,
                 cursor: addToGroupLoading ? 'not-allowed' : 'pointer',
                 fontSize: '1rem'
               }}
             >
               {addToGroupLoading ? 'جاري الإضافة...' : '➕ إضافة إلى المجموعة'}
             </button>
           </div>
         </form>
       </div>
 
       {message && <NotificationPage text={message} status={status as any} k={k} />}
     </>
   );
 }
