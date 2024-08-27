import React from 'react'
import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AiFillCloseSquare } from "react-icons/ai";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Register = () => {
    const navigate = useNavigate();
    const [smartId, setSmartId] = useState('');
    const [data, setData] = useState({
        smartid: "",
        firstname: "",
        middlename: "",
        lastname: "",
        course: "",
        department: "",
        address: ""

    })

    function handleInput(e) {
        const newData={...data};
        newData[e.target.id] = e.target.value;
        setData(newData);

        if(e.target.id === 'smartid') {
            if(e.target.value.trim() !== ''){
                handleRegister(e);
            }
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        console.log(data);
        axios.post('http://localhost:5000/register', data)
            .then(() => {
                console.log("Register Successful");
                toast.success('Successfully Registered', { duration: 3000 });
                
                // Clear the form data after successful registration
                setData({
                    smartid: "",
                    student_no: "",
                    firstname: "",
                    middlename: "",
                    lastname: "",
                    course: "",
                    department: "",
                    address: ""
                });
                // Reload the form after a short delay
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 2000);

                
            })
            .catch(err => {
                console.log(err);
            });
    }

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8081');

        ws.onopen = function (event) {
            console.log('WebSocket connection opened.');
        };

        ws.onmessage = function (event) {
            console.log('Message received:', event.data);

            if (event.data.startsWith('User not found for UID: ')) {
                const uid = event.data.split(':')[1].trim(); 
                console.log('UID received:', uid); 

                setData({ ...data, smartid: uid });

                setSmartId(uid);
                toast.success('Successfuly Scan your ID', { duration: 3000 });

            } else {
                setUserData(JSON.parse(event.data));
                toast.success('LOGIN', { duration: 5000 });

            }
        };

        ws.onclose = function (event) {
            console.log('WebSocket connection closed.');
        };

        return () => {
            ws.close();
        };
    }, []);



    return (
        <>
        <Navbar/>
        <Sidebar/>
        <div className='ml-64 fixed inset-0 flex items-center justify-center mt-12'>
            <div className='bg-gray-700 rounded-md m-auto p-10 w-auto'>

                <form onSubmit={(e) => handleRegister(e)}>
                    <div className='grid grid-cols-1 items-center'>
                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Please Tap your ID First!'
                            name='smartid'
                            id='smartid'
                            value={smartId}
                            onChange={(e) => handleInput(e)} 
                          
                            required
                  
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='First Name'
                            name='firstname'
                            id='firstname'
                            value={data.firstname}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Middle Name'
                            name='middlename'
                            id='middlename'
                            value={data.middlename}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Last Name'
                            name='lastname'
                            id='lastname'
                            value={data.lastname}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Course'
                            name='course'
                            id='course'
                            value={data.course}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Department'
                            name='department'
                            id='department'
                            value={data.department}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />

                        <input
                            className='w-80 border-2 rounded-md p-1 font-mono hover:shadow-blue-700 shadow-md'
                            type='text'
                            placeholder='Address'
                            name='address'
                            id='address'
                            value={data.address}
                            onChange={(e) => handleInput(e)}
                            required
                        />
                        <br />



                    </div>

                    <button type='submit' className='text-white bg-blue-600 font-semibold text-xl px-2 p-1 rounded-md hover:bg-blue-500'>Submit</button>
                </form>
            </div>
            <Toaster className='w-80 text-lg' />
        </div>

        </>
    )
}

export default Register