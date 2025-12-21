'use client'
import { useState, useEffect } from 'react';
import styles from './profile.module.css';


import { useRouter } from 'next/navigation';
import { verifyTokenApi } from '../apis/auth';
import NavbarPage from '../components/Navbar';
import InstructorDashboard from '../instructorDashboard/page';
import Link from 'next/link';


// Define TypeScript interfaces based on the API response
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Lecture {
  _id: string;
  title: string;
  date: string;
  description: string;
  videos: string[];
  objectives: string[];
  createdAt: string;
  updatedAt: string;
}

interface Group {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  lectures: Lecture[];
}

interface LectureProgress {
  task: {
    taskStatus: string;
    submittedAt: string | null;
    file: string;
    score: number;
    notes: string;
  };
  lecture: string;
  engagement: number;
  attendance: string;
  lectureScore: number;
  notes: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseProgress {
  _id: string;
  course: string;
  lectureProgress: LectureProgress[];
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  _id: string;
  user: string;
  age: number ;
  gender: string;
  courses: Course[];
  groups: Group[];
  courseProgress: CourseProgress[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  user: User & { profileRef: Profile };
  message: string;
}

const ProfilePage = () => {
  const [userData, setUserData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set());
  const [expandedProgress, setExpandedProgress] = useState<Set<string>>(new Set());
  const router = useRouter();

    useEffect(() => {
        // التقاط التوكن وبيانات المستخدم من الرابط وتخزينهم في localStorage
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userParam = params.get('user');
        if (token) {
            localStorage.setItem('token', token);
            if (userParam) {
                try {
                    const user = JSON.parse(decodeURIComponent(userParam));
                    localStorage.setItem('user', JSON.stringify(user));
                } catch (e) {}
            }
            // تحقق من التوكن وجلب بيانات المستخدم من السيرفر
            (async () => {
                await verifyTokenApi();
                // إعادة تحميل الصفحة لإزالة التوكن من الرابط وتحديث الحالة
                window.location.replace('/profile');
            })();
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const verified = await verifyTokenApi();
                if (!verified) {
                    router.push('/login');
                    return;
                }
                const user = JSON.parse(localStorage.getItem("user") || '{}');
                if(user.role === 'instructor'){
                    router.push('/instructorDashboard');
                }
                if(user.role === 'manager'){
                    router.push('/dashboard');
                }
                setUserData(user);
            } catch (error) {
                console.error('Error verifying token:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found in local storage');
          setLoading(false);
          return;
        }

        const response = await fetch('https://code-minds-website.vercel.app/api/auth/verifyToken', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data: ApiResponse = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const toggleLecture = (lectureId: string) => {
    const newExpandedLectures = new Set(expandedLectures);
    if (newExpandedLectures.has(lectureId)) {
      newExpandedLectures.delete(lectureId);
    } else {
      newExpandedLectures.add(lectureId);
    }
    setExpandedLectures(newExpandedLectures);
  };
  const toggleProgress = (progressId: string) => {
    const newExpandedProgress = new Set(expandedProgress);
    if (newExpandedProgress.has(progressId)) {
      newExpandedProgress.delete(progressId);
    } else {
      newExpandedProgress.add(progressId);
    }
    setExpandedProgress(newExpandedProgress);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Check if URL is a YouTube video
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (loading) {
    return <div className={styles.loading}>Loading your profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!userData || !userData.user) {
    return <div className={styles.error}>No user data available</div>;
  }

  const { profileRef } = userData.user;

  return (
    <>
    <NavbarPage />
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.userInfoCard}>
          <img src={userData.user.avatar} alt={userData.user.name} className={styles.userAvatar} />
          <div className={styles.userDetails}>
            <h1>{userData.user.name}</h1>
            <p className={styles.userRole}>{userData.user.role}</p>
            <p className={styles.userEmail}>{userData.user.email}</p>
            <p className={styles.userPhone}>{userData.user.phone}</p>
            <div className={styles.userMeta}>
              <span>Age: {profileRef.age}</span>
              <span>Gender: {profileRef.gender}</span>
              <span>Member since: {formatDate(userData.user.createdAt)}</span>
              {(
                userData.user.role === 'instructor' ? (
                  // here go to instrudtor dash board 
                  <Link href="/instructorDashboard">  
                  <button >Go to Instructor Dashboard</button>
                  </Link>
                ) : null
              )}

              {(
                userData.user.role === 'manager' ? (
                  // here go to manager dash board 
                  <Link href="/dashboard">  
                  <button >Go to Manager Dashboard</button>
                  </Link>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.contentSection}>
          <h2>Enrolled Courses</h2>
          <div className={styles.coursesGrid}>
            {profileRef.courses.map((course, index) => (
              <div key={`${course._id}-${index}`} className={styles.courseCard}>
                <h3>{course.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contentSection}>
          <h2>Your Groups</h2>
          <div className={styles.groupsList}>
            {profileRef.groups.map((group) => (
              <div key={group._id} className={styles.groupCard}>
                <div 
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group._id)}
                >
                  <h3>{group.title}</h3>
                  <span className={styles.toggleIcon}>
                    {expandedGroups.has(group._id) ? '▼' : '►'}
                  </span>
                  <span className={styles.dateRange}>
                    {formatDate(group.startDate)} - {formatDate(group.endDate)}
                  </span>
                  <span className={styles.lectureCount}>
                    {group.lectures.length} lecture{group.lectures.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {expandedGroups.has(group._id) && (
                  <div className={styles.groupContent}>
                    {group.lectures.length > 0 ? (
                      <div className={styles.lecturesList}>
                        {group.lectures.map((lecture) => (
                          <div key={lecture._id} className={styles.lectureCard}>
                            <div 
                              className={styles.lectureHeader}
                              onClick={() => toggleLecture(lecture._id)}
                            >
                              <h4>{lecture.title}</h4>
                              <span className={styles.toggleIcon}>
                                {expandedLectures.has(lecture._id) ? '▼' : '►'}
                              </span>
                              <span className={styles.lectureDate}>
                                {formatDateTime(lecture.date)}
                              </span>
                            </div>
                            
                            {expandedLectures.has(lecture._id) && (
                              <div className={styles.lectureContent}>
                                <p className={styles.lectureDescription}>{lecture.description}</p>
                                
                                {lecture.videos && lecture.videos.length > 0 && (
                                  <div className={styles.lectureVideos}>
                                    <h5>Video Resources</h5>
                                    <div className={styles.videoGrid}>
                                      {lecture.videos.map((video, idx) => (
                                        <div key={idx} className={styles.videoContainer}>
                                          {isYouTubeUrl(video) ? (
                                            <iframe
                                              src={`https://www.youtube.com/embed/${getYouTubeId(video)}`}
                                              title={`Lecture video ${idx + 1}`}
                                              frameBorder="0"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                              className={styles.videoEmbed}
                                            ></iframe>
                                          ) : (
                                            <div className={styles.videoLink}>
                                              <a href={video} target="_blank" rel="noopener noreferrer">
                                                Watch Video {idx + 1}
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {lecture.objectives && lecture.objectives.length > 0 && (
                                  <div className={styles.lectureObjectives}>
                                    <h5>Learning Objectives</h5>
                                    <ul>
                                      {lecture.objectives.map((objective, idx) => (
                                        <li key={idx}>{objective}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noLectures}>No lectures scheduled for this group yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.contentSection}>
          <h2>Course Progress</h2>
          <div className={styles.progressGrid}>
            {profileRef.courseProgress.map((progress) => {
              const course = profileRef.courses.find(c => c._id === progress.course);
              const attendedLectures = progress.lectureProgress.filter(lp => lp.attendance === 'present').length;
              const totalLectures = progress.lectureProgress.length;
              const progressPercentage = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 0;
              
              return (
                <div key={progress._id} className={styles.progressCard}>
                  <h3>{course ? course.title : 'Unknown Course'}</h3>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                    <span className={styles.progressText}>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                  <div className={styles.progressStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{attendedLectures}/{totalLectures}</span>
                      <span className={styles.statLabel}>Lectures Attended</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {progress.lectureProgress.filter(lp => lp.task.taskStatus === 'submitted').length}
                      </span>
                      <span className={styles.statLabel}>Tasks Submitted</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {progress.lectureProgress.filter(lp => lp.task.taskStatus === 'submitted').length > 0
                          ? Math.round(progress.lectureProgress
                              .filter(lp => lp.task.taskStatus === 'submitted')
                              .reduce((acc, lp) => acc + lp.task.score, 0) / 
                            progress.lectureProgress.filter(lp => lp.task.taskStatus === 'submitted').length)
                          : 0
                        }%
                      </span>
                      <span className={styles.statLabel}>Average Score</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className={styles.contentSection}>
        <h2>Course Progress</h2>
        <div className={styles.progressList}>
          {profileRef.courseProgress.map((progress) => {
            const course = profileRef.courses.find(c => c._id === progress.course);
            const attendedLectures = progress.lectureProgress.filter(lp => lp.attendance === 'present').length;
            const totalLectures = progress.lectureProgress.length;
            const progressPercentage = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 0;
            
            return (
              <div key={progress._id} className={styles.progressCard}>
                <div 
                  className={styles.progressHeader}
                  onClick={() => toggleProgress(progress._id)}
                >
                  <h3>{course ? course.title : 'Unknown Course'}</h3>
                  <span className={styles.toggleIcon}>
                    {expandedProgress.has(progress._id) ? '▼' : '►'}
                  </span>
                  <div className={styles.progressStatsOverview}>
                    <span className={styles.progressPercentage}>{Math.round(progressPercentage)}% Complete</span>
                    <span className={styles.lectureCount}>{attendedLectures}/{totalLectures} Lectures</span>
                  </div>
                </div>
                
                {expandedProgress.has(progress._id) && (
                  <div className={styles.progressDetails}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.lectureProgressList}>
                      <h4>Lecture Progress</h4>
                      {progress.lectureProgress.map((lectureProgress) => {
                        // Find the lecture details from all groups
                        let lectureDetails: Lecture | null = null;
                        for (const group of profileRef.groups) {
                          lectureDetails = group.lectures.find(l => l._id === lectureProgress.lecture) || null;
                          if (lectureDetails) break;
                        }
                        
                        return (
                          <div key={lectureProgress._id} className={styles.lectureProgressItem}>
                            <div className={styles.lectureProgressHeader}>
                              <h5>{lectureDetails ? lectureDetails.title : 'Unknown Lecture'}</h5>
                              <span className={`${styles.attendanceStatus} ${styles[lectureProgress.attendance]}`}>
                                {lectureProgress.attendance}
                              </span>
                            </div>
                            
                            <div className={styles.lectureProgressDetails}>
                              <div className={styles.progressInfo}>
                                <div className={styles.infoRow}>
                                  <span className={styles.infoLabel}>Engagement:</span>
                                  <span className={styles.infoValue}>{lectureProgress.engagement}%</span>
                                </div>
                                <div className={styles.infoRow}>
                                  <span className={styles.infoLabel}>Task Status:</span>
                                  <span className={`${styles.taskStatus} ${styles[lectureProgress.task.taskStatus]}`}>
                                    {lectureProgress.task.taskStatus}
                                  </span>
                                </div>
                                {lectureProgress.task.taskStatus === 'submitted' && (
                                  <>
                                    <div className={styles.infoRow}>
                                      <span className={styles.infoLabel}>Score:</span>
                                      <span className={styles.infoValue}>{lectureProgress.task.score}/100</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                      <span className={styles.infoLabel}>Submitted:</span>
                                      <span className={styles.infoValue}>
                                        {lectureProgress.task.submittedAt ? 
                                          formatDateTime(lectureProgress.task.submittedAt) : 'N/A'}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {lectureProgress.notes && (
                                  <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Notes:</span>
                                    <span className={styles.infoValue}>{lectureProgress.notes}</span>
                                  </div>
                                )}
                                {lectureProgress.task.notes && (
                                  <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Task Notes:</span>
                                    <span className={styles.infoValue}>{lectureProgress.task.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>

    </>
  );
};

export default ProfilePage;