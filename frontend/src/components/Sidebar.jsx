import React from 'react'
import { Link } from 'react-router-dom'
import logoLib from '../assets/logoLib.jpg';
const SideBar = () => {
  return (
    <>
      <div className='w-64 bg-gray-900 mt-12 fixed h-full'>
        <div className='my-2 mb-4 px-4 py-2 flex items-center justify-center'>
          <div className='m-auto mx-5'>
            <img src={logoLib} width={100} height={100} className='border rounded-full' />
          </div>
        </div>
        <hr />
        <ul className='mt-3 text-white font-bold'>
          <li className='mb-2 rounded hover:shadow hover:bg-blue-500 py-2'>
            <Link to="/dashboard">

              Home
            </Link>
          </li>

          <li className='mb-2 rounded hover:shadow hover:bg-blue-500 py-2'>
            <Link to="/register">

              Register
            </Link>
          </li>

          <li className='mb-2 rounded hover:shadow hover:bg-blue-500 py-2'>
            <Link to="">

              Logout
            </Link>
          </li>

        </ul>


      </div>
    </>
  )
}

export default SideBar