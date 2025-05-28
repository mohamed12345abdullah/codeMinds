interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: number;
    duration: number;
    category: string;
    createdAt?: string;
    updatedAt?: string;
}

const baseUrl = "https://code-minds-website.vercel.app/api";

// Course API endpoints
 
const getCourses=async () => {
    try {
        const response = await fetch(`${baseUrl}/courses`);
        if(!response.ok){
            const res=await response.json();
            console.log("Failed to fetch courses:",res);
            throw new Error('Failed to fetch courses');

        }
        const data = await response.json();
        console.log("Courses fetched successfully:",data);
        return data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return error ;
    }
};

const getCourseById = async (id: string): Promise<Course | Error> => {
    try {
        const response = await fetch(`${baseUrl}/courses/${id}`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching course:', error);
        return error as Error;
    }
}

const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | Error> => {
    try {
        const response = await fetch(`${baseUrl}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(course)
        });
        if (!response.ok) throw new Error('Failed to create course');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating course:', error);
        return error as Error;
    }
};

const updateCourse = async (id: string, course: Partial<Course>): Promise<Course | Error> => {
    try {
        const response = await fetch(`${baseUrl}/courses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(course)
        });
        if (!response.ok) throw new Error('Failed to update course');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating course:', error);
        return error as Error;
    }
};

const deleteCourse = async (id: string): Promise<{ message: string } | Error> => {
    try {
        const response = await fetch(`${baseUrl}/courses/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete course');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting course:', error);
        return error as Error;
    }
};

export {getCourses, getCourseById, createCourse, updateCourse, deleteCourse}

