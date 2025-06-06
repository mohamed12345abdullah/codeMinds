'use client';

import { useState } from 'react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { age: number; gender: string }) => void;
}

export default function StudentFormModal({ isOpen, onClose, onSubmit }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    age: '',
    gender: ''
  });
  const [errors, setErrors] = useState({
    age: '',
    gender: ''
  });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {
      age: '',
      gender: ''
    };
    let isValid = true;

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
      isValid = false;
    } else if (isNaN(age)) {
      newErrors.age = 'Age must be a number';
      isValid = false;
    } else if (age < 5 || age > 50) {
      newErrors.age = 'Age must be between 5 and 50';
      isValid = false;
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    } else if (!['male', 'female'].includes(formData.gender)) {
      newErrors.gender = 'Invalid gender selection';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        age: parseInt(formData.age),
        gender: formData.gender
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        position: 'relative'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Complete Your Profile
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="age" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Age
            </label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem'
              }}
              min="5"
              max="50"
            />
            {errors.age && (
              <p style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.age}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gender" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && (
              <p style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.gender}
              </p>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#F3F4F6',
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#4F46E5',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
