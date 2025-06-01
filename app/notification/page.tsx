
'use client'



import { useEffect, useState } from "react";
import "./styles.css";

enum notificationStatus { success = "success", error = "error", warning = "warning" };

type notificationParams = {
 
    text: string;
    status: notificationStatus;
    k: number;
};


export default function NotificationPage(params: notificationParams) {

    const {text, status, k} = params;
    console.log("NotificationPage params:", params);

    
    return (
        <div className="notificationContainer">
        <div key={k} className={status}>
            <h3>{text}</h3>
        </div>
        </div>
    );

}
    
