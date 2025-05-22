
const baseUrl = "https://assiut-robotics-zeta.vercel.app";

type Payload = {
    email: string;
    password: string;
}   

const loginApi= async (payload :Payload)=>{
    try{
    console.log("api function ")
    const response = await fetch(`${baseUrl}/members/login`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            email: payload.email,
            password: payload.password
        })
    })
    console.log("after fetch")
    if(response.ok){
        console.log("ok response")
        const data = await response.json();
        console.log("login success", data);
        return data;
    }else{
        // throw new Error("Failed to login");
        const data = await response.json();
        console.log(" fail to log in ",data )
    }
}
catch(error){
    console.log(error)
}
}



const getCoursesApi = async () => {
    try {
        const response = await fetch(`${baseUrl}/courses`);
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
};

type signupPayload = {
    email: string,
    password: string,
    name: string
}

const signupApi = async (payload: signupPayload) => {
    try {
        const response = await fetch(`${baseUrl}/members/signup`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to signup');
        }
        return await response.json();
    } catch (error) {
        console.error('Error signup:', error);
        return null;
    }
};

export { loginApi, getCoursesApi, signupApi };
