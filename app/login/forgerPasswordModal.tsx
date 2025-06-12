'use client';

import { useState, useEffect } from 'react';
import './forgerPasswordModal.css';

const BASE_URL= 'https://code-minds-website.vercel.app/api/auth';

// const BASE_URL = 'http://localhost:4000/api/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${BASE_URL}/requestChangePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setMessage(data.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h3 className="modal-title">نسيت كلمة المرور؟</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              dir="ltr"
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('تم') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
