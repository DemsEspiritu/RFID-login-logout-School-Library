import React, { Fragment } from 'react'
import { MdOutlineLogout } from "react-icons/md";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const HandleLogout = () => {
    axios.get('http://localhost:5000/logout')
      .then(res => {
        if (res.data.Status === "Success") {
          navigate('/login');
          location.reload(true);
        } else {
          alert("Error");
        }
      }).catch(err => console.log(err));
  }

  return (
    <>
    <nav className='bg-gray-800 px-4 py-3  flex justify-between fixed w-full top-0 z-10'>
        <div className='flex items-center text-xl'>
            <span className='text-white font-semibold'>CSPC LIBRARY</span>
            
        </div>
        <div className='flex items-center '>
            <div className='relative '>
            <button onClick={HandleLogout} className='text-white flex items-center font-serif text-1xl tracking-widest hover:text-red-600'>
               
                    <span className='text-md pl-2'><MdOutlineLogout /></span>
                  </button>
            </div>

        </div>
    </nav>
    </>
  )
}

export default Navbar