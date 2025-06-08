import { config } from 'dotenv';
config();

const baseUrl = "https://code-minds-website.vercel.app/api/auth";
// const baseUrl = "http://localhost:4000/api/auth";
console.log("baseUrl", baseUrl)



type loginParams = {
    email: string;
    password: string;
    rememberMe:boolean;
}   

type registerParams = {
    name: string;
    email: string;
    password: string;
    phone: string;
}



// Function to get client IP
const getClientIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return null;
    }
};




const loginApi= async (params :loginParams)=>{
    try{
    const clientIP = await getClientIP();
    console.log("login api function ",params)
    const response = await fetch(`${baseUrl}/login`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            email: params.email,
            password: params.password,
            rememberMe: params.rememberMe,
            ipAddress: clientIP,
        })
    })
    console.log("after fetch")
    const data = await response.json();
    if(response.ok){
        console.log("login success", data);
        window.localStorage.setItem("token", data.token);
        console.log("token", localStorage.getItem("token"));
        window.localStorage.setItem("user", JSON.stringify(data.user));
        console.log("user", localStorage.getItem("user"));
        return data ;
    }else{
        return data;
    }
}
catch(error){
    console.log(error)
    return error;
}
}


const registerApi = async (params :registerParams)=>{
    console.log("register api",params)
    console.log("baseUrl", baseUrl)
    try{
    const clientIP = await getClientIP();
    console.log("register api function ",params)
    const response = await fetch(`${baseUrl}/register`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            name: params.name,
            email: params.email,
            password: params.password,
            phone: params.phone,
            ipAddress: clientIP
        })
    })
    console.log("after fetch")
    if(response.ok){
        console.log("ok response")
        const data = await response.json();
        console.log("register success", data);
        return data;
    }else{
        // throw new Error("Failed to login");
        const data = await response.json();
        console.log(" fail to register ",data )
        return data;
    }
}
catch(error){
    console.log(error)
    return error;
}
}


const sendIpApi = async (page:string) => {
    try{
    const clientIP = await getClientIP();
    console.log("api function ", page, clientIP)
    const response = await fetch(`https://code-minds-website.vercel.app/api/users/view`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            ip: clientIP,
            page: page
        })
    })
    if(response.ok){
        console.log("ok response")
        const data = await response.json();
        console.log("send ip success", data);
        return data;
    }else{
        // throw new Error("Failed to login");
        const data = await response.json();
        console.log(" fail to send ip ",data )
        return data;
    }
}
catch(error){
    console.log(error)
    return error;
}
}



const verifyTokenApi = async () => {
    try{
    const response = await fetch(`${baseUrl}/verifyToken`,{
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        }
    })
    if(response.ok){
        console.log("ok response")
        const data = await response.json();
        console.log("verify token success", data);
        localStorage.setItem("user", JSON.stringify(data.user));
    
    }else{
        // throw new Error("Failed to login");
        const data = await response.json();
        console.log(" fail to verify token ",data )
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
    }
}
catch(error){
    console.log(error)
    return error;
}
}




export { loginApi, registerApi, sendIpApi, verifyTokenApi };
