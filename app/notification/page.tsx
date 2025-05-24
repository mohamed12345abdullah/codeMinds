
'use client'



import { useState } from "react";
import "./styles.css";

enum notificationStatus { success = "success", error = "error", warning = "warning" };

type notificationParams = {
 
    text: string;
    status: notificationStatus;
    key: number;
};


export default function NotificationPage(params: notificationParams) {

    const {text, status, key} = params;
    
    const [notification, setNotification] = useState(params);   
    
    
    
    return (
        <div className="container">
        <div key={key} className={status}>
            <h3>{text}</h3>
        </div>
        </div>
    );

}
    
