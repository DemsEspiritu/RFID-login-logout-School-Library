import React from 'react';
import { BrowserRouter,  Route, Routes} from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MainDash from './pages/MainDash';
import Register from './pages/Register';




const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/dashboard" element={<Dashboard />}>


        </Route>
        <Route path="/main" element={<MainDash />}></Route>
        <Route path="/register" element={<Register />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
