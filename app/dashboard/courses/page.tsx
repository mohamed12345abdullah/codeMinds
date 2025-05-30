'use client'

import Navbar from "@/app/components/Navbar";
import { createCourse, getCourses, updateCourse } from "@/app/apis/course";
import { useEffect, useState } from "react";
import NotificationPage from "@/app/notification/page";
import "./courses.css"
enum notificationStatus { success = "success", error = "error", warning = "warning" };




const createCourse = async (params:{title:string,description:string,price:number,image:File})=> {
  try {
      const response = await fetch(`${baseUrl}/courses`, {
          method: 'POST',
          headers: {
              'Content-Type': 'multipart/form-data',
          },
          body: JSON.stringify({title:params.title,description:params.description,price:params.price,image:params.image})
      });
      if (!response.ok) throw new Error('Failed to create course');
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error creating course:', error);
      return error as Error;
  }
};

const updateCourse = async (params:{id: string,title:string,description:string,price:number,image:File})=> {
  try {
      const response = await fetch(`${baseUrl}/courses/${params.id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'multipart/form-data',
          },
          body: JSON.stringify({title:params.title,description:params.description,price:params.price,image:params.image})
      });
      if (!response.ok) throw new Error('Failed to update course');
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error updating course:', error);
      return error as Error;
  }
};






type Course = {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageUrl:string ;
}




export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [isAdd, setIsAdd] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    price: '',
    image:File
  });

  useEffect(()=> {
    getCourses().then((res) => {
      console.log(res);
      if (!res.success) {
        // NotificationPage({text: res.message, status: notificationStatus.error, key: Date.now()});
      } else {
        // NotificationPage({text: "Courses fetched successfully", status: notificationStatus.success, key: Date.now()});
        setCourses(res.data);
      }
    });
  }, []);



  const handleEdit = (course: Course) => {
    setFormData({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      image:File
    });
    setIsAdd(false);
    setCourseModalOpen(true);
  };

  const handleCloseModal = () => {
    // e.preventDefault();
    setCourseModalOpen(false);
    setFormData({
      _id: '',
      title: '',
      description: '',
      price: '',
      image:File  
    });
    setIsAdd(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكنك إضافة الكود الخاص بتحديث الكورس
    console.log(' course data:', formData);
    if(isAdd){
      createCourse({title:formData.title,description:formData.description,price:Number(formData.price),image:formData.image}).then((res) => {
        console.log(res);
        if (!res.success) {
          // NotificationPage({text: res.message, status: notificationStatus.error, key: Date.now()});
        } else {
          // NotificationPage({text: "Course created successfully", status: notificationStatus.success, key: Date.now()});
          setCourses([...courses, res]);
          handleCloseModal();
        }
      });
    }else{
      const courseData = {
        id: formData._id,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image
      };
      updateCourse(courseData).then((res) => {
        console.log(res);
        if (!res.success) {
          // setCourses(res.data);

          // NotificationPage({text: res.message, status: notificationStatus.error, key: Date.now()});
        } else {
          // NotificationPage({text: "Course updated successfully", status: notificationStatus.success, key: Date.now()});
          handleCloseModal();
        }
      });
    }
    handleCloseModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  return (
    <div  className="course-manager-container">
      {/* <Navbar /> */}
      <h2>courses Dashboard</h2>
     
      <div className="addCourse">
            <button onClick={() => setCourseModalOpen(true)}>Add Course</button>
      </div>

       {courses &&   <div className="courses-grid">
            {courses.map((course) => (
                <div key={course._id} className="course-card">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p>{course.price}</p>
                    <img src={course.imageUrl} alt="" />
                    <button onClick={() => handleEdit(course)}>edit</button>
                    <button>delete</button>
                </div>  
            ))}
        </div>}


        {/* Edit Course Modal */}
        {courseModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">تعديل الكورس</h3>
                <button onClick={handleCloseModal} className="close-button">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="title">عنوان الكورس</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">وصف الكورس</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="form-textarea"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">السعر</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">الصورة</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={handleCloseModal} className="cancel-button">
                    إلغاء
                  </button>
                  <button type="submit" className="submit-button">
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );
}