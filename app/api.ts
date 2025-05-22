
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




export { loginApi };
