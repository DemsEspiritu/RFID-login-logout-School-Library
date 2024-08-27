import React, { useState, useEffect } from 'react';
import logoLib from '../assets/logoLib.jpg'
import UserLogo from '../assets/user1.png'
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Toaster, toast } from 'react-hot-toast';
import { LuArrowBigDown } from "react-icons/lu";
import '../App.css'
import { Link } from 'react-router-dom';
import { FcNfcSign } from "react-icons/fc";

const ScanView = () => {
  const [userData, setUserData] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8081');

    console.log('WebSocket connection established.');

    ws.onopen = function (event) {
      console.log('WebSocket connection opened.');
    };

    ws.onmessage = function (event) {
      console.log('Message received:', event.data);

      if (event.data.startsWith('User not found for UID:')) {
        const uid = event.data.split(':')[1].trim();
        setUserNotFound(true);
        toast.error('User Not Found', { duration: 3000 });

        setTimeout(() => {
          setUserNotFound(false);
        }, 3000);

      } else {
        setUserData(JSON.parse(event.data));
        toast.success('LOGIN', { duration: 5000 });

        setTimeout(() => {
          setUserData(null);
        }, 5000);
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
    <div class="responsive-margin grid grid-cols-2 items-center justify-items-center h-auto">
      <div className='justify-center items-center w-1/2 '>
        <h1 className=' text-center font-bold font-serif tracking-widest .sm:text-2xl md:text-5xl'>WELCOME</h1>
        <h1 className=' text-center font-bold font-serif tracking-widest md:text-2xl lg:text-4xl'>TO</h1>
        <h1 className='text-4xl text-center font-bold font-serif tracking-wider lg:text-5xl'>CSPC LIBRARY</h1>

        <div className='flex justify-center items-center mt-5'>
          <img src={logoLib} width={250} height={250} className='border rounded-full' alt="Library Logo" />
        </div>
      </div>
      <div className='w-1/2'>
        <div className=' rounded-md mt-10 h-96 shadow-black shadow-md'>
          {userData ? (
            <div>
              <h1 className='text-center text-md tracking-tight  font-mono mt-2 pt-2'>Camarines Sur Polytechnic Colleges</h1>
              <h1 className='text-center text-md tracking-tight  font-mono '>Nabua Camarines Sur</h1>
              <div className='grid grid-cols-2 items-center text-left justify-center ml-4 my-5'>
                <div>
                  <h1 className='font-bold font-mono text-md'>ISO: 9001:2008</h1>
                  <h1 className='font-bold font-mono text-md'>SN: {userData.student_no}</h1>
                </div>
                <div className='flex justify-center items-center p-5'>
                  <img src={UserLogo} width={130} height={130} className='border rounded' alt="User" />
                </div>
              </div>
              <p className='font-bold font-mono text-lg mb-2'>{userData.firstname} {userData.middlename} {userData.lastname}</p>
              <p className='font-bold font-mono text-md'>{userData.address.toUpperCase()}</p>
              <p className='font-bold font-mono text-left text-lg border-y-2 mt-2  w-auto'>{userData.course}</p>
            </div>
          ) : userNotFound ? ( // Display user not found message if userNotFound is true
            <div className='grid grid-cols-1 items-center justify-items-center'>
              <div>
                <p className='font-bold text-2xl text-red-600 mt-11'>User not found.</p>
                <h1 className='animate-bounce text-9xl text-black flex justify-center mt-20 font-bebas'><LuArrowBigDown /></h1>
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 items-center justify-items-center'>
              <div>
                <p className='font-bold text-lg mt-11'>Please tap your ID</p>
                <h1 className='animate-bounce text-9xl text-black flex justify-center mt-20 font-bebas'><LuArrowBigDown /></h1>
                <h1 className=' text-5xl text-black flex justify-center font-bebas'><FcNfcSign /></h1>
              </div>
            </div>
          )}
        </div>
        <Toaster className='w-80 text-lg' />
        <div className='mt-2'>
          <p className='text-justify font-bold text-red-600'>Reminder</p>
          <p className='text-justify font-sans font-bold text-lg'>Wear a proper uniform and School ID</p>
        </div>
      </div>
    </div>
  );
}

export default ScanView;
