'use client'
import React, { useState } from "react";
import  "./instructor.css";
import Navbar from "../components/Navbar";

const baseUrl = "https://code-minds-website.vercel.app/api";
// const baseUrl = "http://localhost:4000/api";
console.log("baseUrl", baseUrl)

export default function InstructorRequestForm() {
  const [formData, setFormData] = useState({
    specialization: "",
    experienceYears: "",
    bio: "",
    github: "",
    linkedin: "",
    coursesCanTeach: "",
    cv: null as File | null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'cv' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, cv: file });
      setFileName(file.name);
      setErrors({ ...errors, cv: "" });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cv) {
      setErrors({ ...errors, cv: "CV file is required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
        }
      });

      const res = await fetch(`${baseUrl}/instructor`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: formDataToSend,
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
          cv: null,
        });
        setFileName("");
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
        {renderFileInput("CV", "cv")}
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
        <div className="instructorFormInput">
          <input
            type={type}
            name={name}
            value={formData[name as keyof typeof formData] as string}
            onChange={handleChange}
            className={`instructorFormInput ${errors[name as keyof typeof errors] ? "border-red-500" : "border-gray-300"}`}
          />
        </div>
        {errors[name as keyof typeof errors] && <p className="text-red-500 text-sm mt-1">{errors[name as keyof typeof errors]}</p>}
      </div>
    );
  }

  function renderFileInput(label: string, name: string) {
    return (
      <div>
        <label className="instructorFormLabel">{label}</label>
        <div className="instructorFormInput file-input-container">
          <input
            type="file"
            name={name}
            onChange={handleChange}
            accept=".pdf,.doc,.docx"
            className={`file-input ${errors[name as keyof typeof errors] ? "border-red-500" : "border-gray-300"}`}
          />
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
        {errors[name as keyof typeof errors] && <p className="text-red-500 text-sm mt-1">{errors[name as keyof typeof errors]}</p>}
      </div>
    );
  }
}
