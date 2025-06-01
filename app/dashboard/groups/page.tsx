'use client'
import React, { useEffect, useState } from "react";
import "./groups.css";

interface CourseType {
  _id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

interface InstructorType {
  _id: string;
  name: string;
  email: string;
  profileRef: {
    specialization: string;
  }
}

interface GroupType {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  instructor: InstructorType;
  course: CourseType;
}

interface FormDataType {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  instructorId: string;
  courseId: string;
}

const GroupForm = () => {
  const [formData, setFormData] = useState<FormDataType>({
    _id: "",
    title: "",
    startDate: "",
    endDate: "",
    totalSeats: 0,
    instructorId: "",
    courseId: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [instructors, setInstructors] = useState<InstructorType[]>([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/groups", {
        headers: {
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setGroups(data.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/courses");
      const data = await res.json();
      setCourses(data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/instructor");
      const data = await res.json();
      setInstructors(data.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchCourses();
    fetchInstructors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = formData._id
        ? `http://localhost:4000/api/groups/${formData._id}`
        : "http://localhost:4000/api/groups";
      
      const method = formData._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalSeats: formData.totalSeats,
          courseId: formData.courseId,
          instructorId: formData.instructorId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save group");

      await fetchGroups();
      closeModal();
      setFormData({
        _id: "",
        title: "",
        startDate: "",
        endDate: "",
        totalSeats: 0,
        instructorId: "",
        courseId: "",
      });
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    // confirm to delelte
    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(`http://localhost:4000/api/groups/${id}`, {
        method: "DELETE",
        headers:{
          'authorization': `Bearer ${window.localStorage.getItem("token")}`,
        }
      });

      if (!response.ok) throw new Error("Failed to delete group");

      await fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleUpdateGroup = (group: GroupType) => {
    setFormData({
      _id: group._id,
      title: group.title,
      startDate: group.startDate.split('T')[0],
      endDate: group.endDate.split('T')[0],
      totalSeats: group.totalSeats,
      instructorId: group.instructor._id,
      courseId: group.course._id,
    });
    openModal();
  };

  return (
    <div className="group-manager-container">
      <button onClick={openModal} className="add-group-btn">Add Group</button>
      
      <div className="groups-grid">
        {groups?.map((group) => (
          <div key={group._id} className="group-card">
            <h3>{group.title}</h3>
            <div className="group-details">
              <p><strong>Course:</strong> {group.course.title}</p>
              <p><strong>Start Date:</strong> {new Date(group.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(group.endDate).toLocaleDateString()}</p>
              <p><strong>Total Seats:</strong> {group.totalSeats}</p>
              <p><strong>Instructor:</strong> {group.instructor.name}</p>
            </div>
            <div className="group-actions">
              <button onClick={() => handleUpdateGroup(group)} className="update-btn">
                Update
              </button>
              <button onClick={() => handleDeleteGroup(group._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <form onSubmit={handleSubmit} className="group-form">
            <div onClick={closeModal} className="close-button">X</div>
            
            <input
              type="text"
              name="title"
              placeholder="Group Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="group-input"
            />

            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="group-input"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>

            <select
              name="instructorId"
              value={formData.instructorId}
              onChange={handleChange}
              required
              className="group-input"
            >
              <option value="">Select Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {`${instructor.name} , ${instructor.profileRef.specialization}`}
                </option>
              ))}
            </select>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="group-input"
            />

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="group-input"
            />

            <input
              type="number"
              name="totalSeats"
              placeholder="Total Seats"
              value={formData.totalSeats}
              onChange={handleChange}
              required
              className="group-input"
            />

            <button type="submit" className="submit-btn">
              {formData._id ? "Update Group" : "Create Group"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GroupForm;
