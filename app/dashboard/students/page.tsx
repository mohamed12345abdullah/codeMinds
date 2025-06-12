


'use client';

import { useState, useEffect } from 'react';
import EnrollmentRequests from './enrollmentRequests';
import Navbar from '@/app/components/Navbar';
import './students.css'
export default function StudentsPage() {
    return (
        <div className='students-container'>
            <Navbar/>

            <EnrollmentRequests/>
            
        </div>
    );
}
