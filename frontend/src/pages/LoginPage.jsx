import React, { useState } from 'react';
import { AiFillCloseSquare } from "react-icons/ai";
import logoLib from '../assets/logoLib.jpg';
import cspcback from '../assets/cspcback.jpg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Audio, Circles, RotatingSquare, Triangle } from 'react-loader-spinner';

function LoginPage() {
  const [values, setValues] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('http://localhost:5000/login', values)
      .then(res => {
        if (res.data.Status === "Success") {
          setTimeout(() => {
            navigate('/dashboard');
            setLoading(false);
          }, 2000);
        } else {
          alert(res.data.Message);
          setLoading(false);
        }
      })
      .catch(err => console.log(err));
  }

  // const myStyle = {
  //   backgroundImage: `url(${cspcback})`,
  //   height: "100vh",
  //   backgroundSize: "cover",
  //   backgroundRepeat: "no-repeat",
  // };


  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center  z-50 bg-white">
          <Circles color="blue" height={150} width={150} />
        </div>
      )}
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className="absolute w-full"></div>
        <div className="grid grid-cols-2 shadow-black shadow-lg bg-white opacity-80 p-16 rounded-lg z-50 w-auto h-auto relative">
  <div className='absolute top-4 right-4 rounded-full'>
    <Link to="/" className="text-4xl  text-red-600 hover:text-red-500"><AiFillCloseSquare /></Link>
  </div>
  <div className='m-auto mx-5 '>
    <img src={logoLib} width={200} height={200} className='border rounded-full' />
  </div>

  <form onSubmit={handleSubmit} method='POST'>
    <div className='grid justify-items-center  mt-auto border-l-2'>
      <div className="my-6">
        <label className="block text-sm font-medium text-center text-gray-700"></label>
        <input
          type="text"
          placeholder="Username"
          name='username'
          onChange={e => setValues({ ...values, username: e.target.value })}
          className="mt-1 w-86 border-2 border-black h-8 rounded-md shadow-sm text-center" />
      </div>
      <div className="mb-4 items-center">
        <label className="block text-sm font-medium text-center text-gray-700"></label>
        <input
          type="password"
          placeholder="Password"
          name='password'
          onChange={e => setValues({ ...values, password: e.target.value })}
          className="mt-1 w-86 h-8 border-2 border-black text-center rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
      </div>
      <div className='flex items-center justify-between w-auto'>
        <div>
          <button type="submit" className="w-86 h-auto bg-blue-500 text-white py-2 px-4 rounded-md font-serif hover:bg-blue-600">
            Login
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

        </div>
    </>
  )
}

export default LoginPage;
