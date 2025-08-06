'use client';

import { useState, useEffect } from 'react';
import NotificationPage from '../notification/page';
import Navbar from '../components/Navbar';
import styles from './courses.module.css';
import CourseDetailModal from './CourseDetailModal';
import { sendIpApi, verifyTokenApi } from '../apis/auth';
import { getCourses } from '../apis/course';
const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
}




// ==================== student form modal ====================
import StudentFormModal from './studentForm';


// In your JSX:


// ==================== student form modal ====================






type Student = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    age: number;
    gender: Gender;
    courses?: [] | null;

}

type Group = {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    availableSeats: number;
    totalSeats: number;
    instructor?: string;
    students?: [] | null;
}

type Course = {
    _id: string;
    title: string;
    description: string;
    price: number|null;
    imageUrl: string;
    isOpen: boolean;
    avilableGroups?: Group[] | null;
}




const groupA: Group = {
    _id: '1',
    name: 'Group A',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    availableSeats: 5,
    totalSeats: 5,
    instructor: 'asmaa ',
    students: null
}

const groupB: Group={
    _id:'2',
    name:'Group B',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    availableSeats: 5,
    totalSeats: 5,
    instructor: 'abdullah',
    students: null
}

// const pythonCourse: CourseDetails = {
//     course: {
//     _id: '1',
//     title: 'Python Programming',
//     description: 'Learn the fundamentals of Python programming',
//     price: 99.99,
//     imageUrl: 'https://www.livewireindia.com/blog/wp-content/uploads/2019/03/Python-Programming-training-1024x537.jpg',
//     },
//     isOpen: true,
//     onClose: () => {},
//     avilableGroups: [groupA,groupB]
// }


// const CppCourse: CourseDetails = {
//     course: {
//     _id: '2',
//     title: 'C++ Programming',
//     description: 'Learn the fundamentals of C++ programming',
//     price: 99.99,
//     imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSGePKrQcfI6LjsSHTtm240HjN590eh6K9YQ&s',
//     },
//     isOpen: true,
//     onClose: () => {},
//     avilableGroups: [groupA,groupB]
// }


// const initialCourses: CourseDetails[] = [
//     pythonCourse,
//     CppCourse
// ]


export default function CoursesPage() {

        // In your component:
    const [isModalstudentOpen, setIsModalstudentOpen] = useState(false);
    const [courseId,setCourseId]=useState<string|null>(null);
    const handleSubmit = async (data: { age: number; gender: string }) => {
    // Handle the form submission here
    console.log(data);
    setIsModalstudentOpen(false);
    const response=await fetch(`${baseUrl}/students`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log("Enrolled in course successfully!", result.message);
    if(result.success){
        showNotification(result.message, notificationStatus.success);

        handleEnroll(courseId);
    }else{
        showNotification(result.message, notificationStatus.error);
    }
    };

    useEffect(() => {
        sendIpApi("courses");
    }, []);
    const [courses, setCourses] = useState<Course[]>([]);
    enum notificationStatus { success = "success", error = "error", warning = "warning" };
    const [notifi, setNotifi] = useState({
        text: '',
        status: notificationStatus.success,
        key: Date.now()
    });
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await getCourses();
            if(response instanceof Error){
                showNotification("Error fetching courses!", notificationStatus.error);
                return;
            }
            setCourses(response.data);
            showNotification("Courses fetched successfully!", notificationStatus.success);
            console.log("Courses fetched successfull================:", response);
        } catch (error) {
            console.error("Error fetching courses:", error);
            showNotification("Error fetching courses!", notificationStatus.error);
        }
    };
    useEffect(() => {
        fetchCourses(); 
        verifyTokenApi();
    }, []);


    const handleEnroll = async (courseId: string|null) => {
        try {
        setCourseId(courseId);
        const token=localStorage.getItem("token");
        console.log("token", token);
        // showNotification("token exists", notificationStatus.success);
        if(!token){
            showNotification("Please login first!", notificationStatus.error);
            console.log("Please login first!");
            // go to log in 
            window.location.href = "../login";
            return;
        }
        const user=JSON.parse(localStorage.getItem("user")||"");
        console.log("user", user);
        if(!user){
            showNotification("Please login first!", notificationStatus.error);
            return;
        }    

        if(user.role!="student"){  
            showNotification("Please complete your profile first!", notificationStatus.warning);
            setIsModalstudentOpen(true);
        }

        const course = courses.find(c => c._id === courseId);
        if (course) {
            console.log("Enrolled in", course.title);
            showNotification(`Enrolled in ${course.title}!`, notificationStatus.success);
            // Here you would typically make an API call to enroll the user
            const response=await fetch(`${baseUrl}/students/enroll`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    courseId: courseId,
                })
            });
            const result = await response.json();
            const {message,data,success}=result;
            console.log("Enrolled in course successfully!", result);
            if(success){
                showNotification(message, notificationStatus.success);
            }else if(response.status==401){
                    showNotification("Please login first!", notificationStatus.warning);
                    location.href="../login";
            }else if(response.status==403){
                showNotification("Please complete your profile first!", notificationStatus.warning);
                setIsModalstudentOpen(true);
            }
            else{
                showNotification(message, notificationStatus.error);
            }
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
        showNotification("Error enrolling in course!", notificationStatus.error);
    }
    };

    const showNotification = (message: string, status: notificationStatus) => {
        setNotifi({
            text: message,
            status: status,
            key: Date.now()
        });
    };

    useEffect(() => {
        console.log("verify token");
        const token=localStorage.getItem("token");
        if(!token){
            showNotification("Please login first!", notificationStatus.error);
            return;
        }
        // verifyTokenApi();
    }, []);

    return (
        <div className={styles.courses}>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Our Courses</h2>
                    <p>Explore our selection of robotics courses</p>
                </div>

                <div className={styles.grid}>
                    {courses.slice(0, showMore ? courses.length : 3).map((courseDetails:Course) => (
                        <div key={courseDetails._id} className={styles.courseCard}>
                            <div className={styles.courseImage}>
                                <img 
                                    src={courseDetails.imageUrl}
                                    alt={courseDetails.title}
                                    className={styles.courseImage}
                                />
                            </div>
                            <div className={styles.courseContent}>
                                <h3>{courseDetails.title}</h3>
                                <p>{courseDetails.description}</p>
                                <div className={styles.courseMeta}>
                                    <div> {courseDetails.isOpen ? 'Open' : 'Closed'}</div>
                                    {(courseDetails.avilableGroups && courseDetails.avilableGroups.length > 0) && <div> next group start in {courseDetails.avilableGroups?.[0].startDate}</div>}
                                </div>
                                <button 
                                    className={styles.courseButton}
                                    onClick={() => {
                                        setSelectedCourse(courseDetails );
                                        setIsModalOpen(true);
                                    }}
                                >
                                    Learn More
                                </button>
                                <div className={styles.coursePrice}>
                                    <span className={styles.price}>${courseDetails.price}</span>
                                    <button
                                        onClick={() => handleEnroll(courseDetails._id || null)}
                                        className={styles.enrollButton}
                                    >
                                        Enroll Now
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {courses.length > 3 && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button
                            onClick={() => setShowMore(!showMore)}
                            style={{
                                background: 'linear-gradient(90deg, #4f46e5 0%, #148543 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '12px 32px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)',
                                transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                                letterSpacing: '0.5px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(90deg, #3730a3 0%, #0e5c2f 100%)';
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #148543 100%)';
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.08)';
                            }}
                        >
                            {showMore ? 'Show Less' : 'Show More'}
                        </button>
                    </div>
                )}
            </div>

            {selectedCourse && (
                <CourseDetailModal 
                courseDetails={selectedCourse}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                />
            )}
            {notifi && <NotificationPage key={notifi.key} text={notifi.text} status={notifi.status} k={notifi.key} />}
            
            {isModalstudentOpen && <StudentFormModal
            isOpen={isModalstudentOpen}
            onClose={() => setIsModalstudentOpen(false)}
            onSubmit={handleSubmit}
            />}
</div>
    );
}
