

'use client'
import React, { useEffect, useState } from "react";
import "./courses.css"
import { getCourses ,deleteCourse } from "../../apis/course";


// لو عندك baseUrl ثابت
const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
interface FormDataType {
  _id: string;
  title: string;
  description: string;
  price: string;
  image: File | null;
}

interface courseType{
  _id:string;
  title:string;
  description:string;
  price:string;
  imageUrl:string;
}

const CourseForm = () => {
  const [formData, setFormData] = useState<FormDataType>({
    _id: "",
    title: "",
    description: "",
    price: "",
    image: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "image" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData._id) {
      await updateCourse(formData);
    } else {
      await createCourse(formData);
    }
    closeModal();
    setFormData({
      _id: "",
      title: "",
      description: "",
      price: "",
      image: null,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [courses,setCourses]=useState([] as courseType[])     
  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };
  
  // Create course with FormData
const createCourse = async (params: FormDataType) => {
  try {
    const formData = new FormData();
    formData.append("title", params.title);
    formData.append("description", params.description);
    formData.append("price", params.price);
    if (params.image) formData.append("image", params.image);
    console.log(formData);
    const response = await fetch(`${baseUrl}/courses`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to create course");

    const data = await response.json();
    console.log("Course created:", data);
    fetchCourses();
    return data;
  } catch (error) {
    console.error("Error creating course:", error);
  }
};


// Update course with FormData
const updateCourse = async (params: FormDataType) => {
  try {
    const formData = new FormData();
    formData.append("title", params.title);
    formData.append("description", params.description);
    formData.append("price", params.price);
    if (params.image) formData.append("image", params.image);
    console.log(formData);
    const response = await fetch(`${baseUrl}/courses/${params._id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update course");

    const data = await response.json();
    console.log("Course updated:", data);
    fetchCourses();
    return data;
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

const handleUpdateCourse = async (course: courseType) => {
  try {
    setFormData({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      image: null,
    });
    openModal();
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

  return (
    <div className="course-manager-container"> 
    <button onClick={openModal}>Add Course</button>
    {
      <div className="courses">
        {
          courses?.map((course) => (
            <div key={course._id} className="course-card">
              <img src={course.imageUrl} alt={course.title} className="course-image" />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>{course.price}</p>
              <button onClick={() => handleUpdateCourse(course)} >Update</button>
              <button onClick={() => handleDeleteCourse(course._id)} >Delete</button>
            </div>
          ))
        }
      </div>
    }
    {
      isModalOpen && (
    <form onSubmit={handleSubmit} className="course-form">
      <div onClick={closeModal} className="close-button"> X </div> 
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="course-input"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
        className="course-input"
      />

      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        required
        className="course-input"
      />

      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="course-input"
      />

      <button
        type="submit"
        className="course-button"
      >
        {formData._id ? "Update Course" : "Create Course"}
      </button>
    </form>
    )
    }
    </div>
  );
};






export default CourseForm;
