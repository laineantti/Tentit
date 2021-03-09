import React, { useCallback } from 'react'
/* import { strings } from './Locale' */
import { useDropzone } from 'react-dropzone'
import request from 'superagent'
import { NavBar } from './NavBar'

var path = null
var default_error = new Error("Environment not properly set!")
let environment = process.env.NODE_ENV || 'development'

switch (environment) {
    case 'production':
        path = 'https://tentti-fullstack.herokuapp.com/'
        break
    case 'development':
        path = 'http://localhost:4000/'
        break
    case 'test':
        path = 'http://localhost:4000/'
        break
    default:
        throw default_error
}

function Upload() {
    const onDrop = useCallback(files => {

        console.log(files);
        const req = request.post(path+"upload");

        files.forEach(file => {
            req.attach('photos', file);
            console.log(file);
        });
        req.end((err, res) => {
            console.log(res)
        });

    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <>
        <NavBar/> 
        <div name="photos" key="photos" style={{ paddingTop: "60px" }} {...getRootProps()}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
        </>
    )
}
export default Upload