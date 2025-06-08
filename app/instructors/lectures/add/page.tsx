'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './add.module.css';
import { FiUpload, FiPlus, FiX } from 'react-icons/fi';
import Navbar from '../../../components/Navbar';

interface Group {
    _id: string;
    title: string;
    course: {
        _id: string;
        title: string;
    };
}

export default function AddLecture() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupId = searchParams.get('groupId');

    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        objectives: [''],
        videos: [] as string[]
    });
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    useEffect(() => {
        const fetchGroup = async () => {
            if (!groupId) {
                router.push('/instructors/dashboard');
                return;
            }

            try {
                const response = await fetch(`http://localhost:4000/api/groups/${groupId}`);
                const result = await response.json();
                if (result.success) {
                    setGroup(result.data);
                }
            } catch (error) {
                console.error('Error fetching group:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroup();
    }, [groupId, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleObjectiveChange = (index: number, value: string) => {
        const newObjectives = [...formData.objectives];
        newObjectives[index] = value;
        setFormData(prev => ({
            ...prev,
            objectives: newObjectives
        }));
    };

    const addObjective = () => {
        setFormData(prev => ({
            ...prev,
            objectives: [...prev.objectives, '']
        }));
    };

    const removeObjective = (index: number) => {
        const newObjectives = formData.objectives.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            objectives: newObjectives
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('videos', files[i]);
        }

        try {
            const response = await fetch('http://localhost:4000/api/upload/videos', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setUploadedFiles(prev => [...prev, ...result.urls]);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupId || !group) return;

        try {
            const response = await fetch('http://localhost:4000/api/lectures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    videos: uploadedFiles,
                    course: group.course._id,
                    group: groupId
                })
            });

            const result = await response.json();
            if (result.success) {
                router.push('/instructors/dashboard');
            }
        } catch (error) {
            console.error('Error creating lecture:', error);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.loading}>جاري التحميل...</div>
                </div>
            </>
        );
    }

    if (!group) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.error}>لم يتم العثور على المجموعة</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>إضافة محاضرة جديدة</h1>
                    <p>المجموعة: {group.title} - {group.course.title}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">عنوان المحاضرة</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="date">تاريخ المحاضرة</label>
                        <input
                            type="datetime-local"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">وصف المحاضرة</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>الأهداف</label>
                        {formData.objectives.map((objective, index) => (
                            <div key={index} className={styles.objectiveInput}>
                                <input
                                    type="text"
                                    value={objective}
                                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeObjective(index)}
                                    className={styles.removeButton}
                                >
                                    <FiX />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addObjective}
                            className={styles.addButton}
                        >
                            <FiPlus />
                            إضافة هدف
                        </button>
                    </div>

                    <div className={styles.formGroup}>
                        <label>فيديوهات المحاضرة</label>
                        <div className={styles.fileUpload}>
                            <input
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={handleFileUpload}
                                className={styles.fileInput}
                            />
                            <div className={styles.uploadButton}>
                                <FiUpload />
                                اختر الفيديوهات
                            </div>
                        </div>
                        {uploadedFiles.length > 0 && (
                            <div className={styles.uploadedFiles}>
                                <h4>الفيديوهات المرفوعة:</h4>
                                <ul>
                                    {uploadedFiles.map((file, index) => (
                                        <li key={index}>{file}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.submitButton}>
                            إضافة المحاضرة
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/instructors/dashboard')}
                            className={styles.cancelButton}
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
} 