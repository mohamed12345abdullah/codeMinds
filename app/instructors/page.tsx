

'use client'
import React, { useState } from "react";
import  "./instructor.css";
import Navbar from "../components/Navbar";


const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api/auth";
console.log("baseUrl", baseUrl)




export default function InstructorRequestForm() {
  const [formData, setFormData] = useState({
    specialization: "",
    experienceYears: "",
    bio: "",
    github: "",
    linkedin: "",
    coursesCanTeach: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch(`${baseUrl}/instructor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const response = await res.json();

      if (res.ok) {
        alert("the request has been sent successfully ✅");
        setFormData({
          specialization: "",
          experienceYears: "",
          bio: "",
          github: "",
          linkedin: "",
          coursesCanTeach: "",
        });
      } else {
        alert("failed to send the request ❌ : " + (response?.message || "try again"));
        if(res.status === 401){
          alert("Unauthorized ❌");
          window.location.href = "/login";
        }
      }
    } catch (error) {
      alert("failed to connect to the server ❌");
      console.error(error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="instructorFormContainer">
      <Navbar />
      <h2 className="">Request to become an instructor</h2>
      <form onSubmit={handleSubmit} className="instructorForm">
        {renderInput("Specialization", "specialization")}
        {renderInput("Years of experience", "experienceYears")}
        {renderInput("About you", "bio")}
        {renderInput("GitHub link", "github")}
        {renderInput("LinkedIn link", "linkedin")}
        {renderInput("Courses you can teach", "coursesCanTeach")}

        <button
          type="submit"
          disabled={isSubmitting}
          className="instructorFormButton"
        >
          {isSubmitting ? "Sending..." : "Send request"}
        </button>
      </form>
    </div>
  );

  function renderInput(label: string, name: string, type = "text") {
  
    return (
      <div>

        <label className="instructorFormLabel">{label}</label>
        <div className=" instructorFormInput">
          <input
            type={type}
            name={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            className={` instructorFormInput ${errors[name as keyof typeof errors] ? "border-red-500" : "border-gray-300"}`}
          />
          
        </div>
        {errors[name as keyof typeof errors] && <p className="text-red-500 text-sm mt-1">{errors[name as keyof typeof errors]}</p>}
      </div>
    );
  }
  
}
