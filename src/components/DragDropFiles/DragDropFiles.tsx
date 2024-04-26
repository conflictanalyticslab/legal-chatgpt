import React, { useState, useRef } from 'react';
import Link from 'next/link';
import crypto from 'crypto';
import { Button } from "@mui/material";
import { getCookie } from 'typescript-cookie'
import './DragDropFiles.css';

function DragDropFiles() {

    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        setFiles(Array.from(files));
    };

    const handleUpload = async () => {
        if (files) {
            // createAlert('Upload successful', 'green');
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const email = getCookie('email')!;
            formData.append('email', email);

            // console.log(email);
    
            const response = await fetch("https://partner.openjustice.ai", {
                method: 'POST',
                body: formData 
            });
    
            if (response.ok) {
                createAlert('Upload successful', 'green');
            } else {
                createAlert('Upload Failed, please try again later!');
            }
            setFiles([]);
        }
    };

    const createAlert = (message: string, backgroundColor = "red") => {
        // Create a new div element for our alert
        const alertDiv = document.createElement('div');
        alertDiv.textContent = message;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '40px';
        alertDiv.style.left = '50%';
        alertDiv.style.transform = 'translate(-50%, -50%)';
        alertDiv.style.backgroundColor = backgroundColor;
        alertDiv.style.color = 'white';
        alertDiv.style.padding = '1em';
        alertDiv.style.zIndex = '1000';
        alertDiv.style.opacity = '0.8';
        alertDiv.style.borderRadius = '10px';
  
        // Append the alert to the body
        document.body.appendChild(alertDiv);
  
        // Remove the alert after 5 seconds
        window.setTimeout(() => {
          document.body.removeChild(alertDiv);
        }, 5000);
    }
    
    return (
        <div style={{marginLeft: "10vw", marginRight: "10vw"}}>
        {files.length == 0?  (
            <div 
                className='dropzone'
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
            <h1>Drop files here</h1>
            <h1>Or</h1>
            <input 
                type="file" 
                multiple onChange={(e) => {
                    if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                    }
                }} 
                ref={fileInputRef}
                hidden
                accept=".pdf, .csv, .xlsx, .json, docx, doc, txt"/>
            <Button variant='outlined' onClick={() => {fileInputRef.current?.click()}}>Select Files</Button>
            </div>
        ) : (
            <div className='dropzone'>
            <h1>Files to be uploaded:</h1>
            <ul>
                {Array.from(files).map((file, index) => (
                    <li key={index}>
                        {file.name}
                        <Button onClick={()=> {
                            const newFiles = Array.from(files);
                            newFiles.splice(index, 1);
                            setFiles(newFiles);
                        }}>remove</Button>
                    </li>
                ))}
            </ul>
            <Button variant='outlined' onClick={handleUpload}>Upload</Button>
            <Button variant='text' onClick={() => setFiles([])}>Clear</Button>
            </div>
        )}
            <Button variant='outlined' style={{display: "flex-end"}}> <Link href="/">Back</Link></Button>
        </div>
    );
};

export { DragDropFiles };