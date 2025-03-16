import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignIn() {
    const [customerInput, setCustomerInput] = useState({
        userName: '',
        email: '',
        licenseNumber: '',
        password: ''
    });

    const [workerInput, setWorkerInput] = useState({
        userName: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleCustomerChange = (e) => {
        setCustomerInput({
            ...customerInput,
            [e.target.name]: e.target.value
        });
    };

    const handleWorkerChange = (e) => {
        setWorkerInput({
            ...workerInput,
            [e.target.name]: e.target.value
        });
    };

    const handleCustomerLogin = async () => {
        try {
            const response = await axios.post('/signin', customerInput);
            if (response.data.message === 'ok') {
                localStorage.setItem('licenseNumber', customerInput.licenseNumber);
                localStorage.setItem('userName', customerInput.userName);
                navigate('/mypage');
            }
        } catch (error) {
            console.error('Sign-In Failed', error);
        }
    };

    const handleWorkerLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/signin/worker', workerInput);
            if (response.data.message === 'ok') {
                localStorage.setItem('workerName', workerInput.userName)
                navigate('/workerpage');
            } else {
                alert('Sign in failed. Worker not found.');
            }
        } catch (error) {
            console.error('Error during worker sign-in:', error);
            alert('Sign in failed. Please try again later.');
        }
    };

    return (
        <div>
            <div>
                <h1>Customer Login</h1>
                <input
                    type="text"
                    name="userName"
                    placeholder="Please enter your User Name"
                    value={customerInput.userName}
                    onChange={handleCustomerChange}
                    required
                /><br />
                <input
                    type="email"
                    name="email"
                    placeholder="Please enter your Email"
                    value={customerInput.email}
                    onChange={handleCustomerChange}
                    required
                /><br />
                <input
                    type="number"
                    name="licenseNumber"
                    placeholder="Please enter your Car License Number"
                    value={customerInput.licenseNumber}
                    onChange={handleCustomerChange}
                    required
                /><br />
                <input
                    type="password"
                    name="password"
                    placeholder="Please enter your Password"
                    value={customerInput.password}
                    onChange={handleCustomerChange}
                    required
                /><br />
                <button onClick={handleCustomerLogin}>Enter</button>
            </div>
            <div>
                <h1>Worker Login</h1>
                <input
                    type="text"
                    name="userName"
                    placeholder="Please enter your User Name"
                    value={workerInput.userName}
                    onChange={handleWorkerChange}
                    required
                /><br />
                <input
                    type="password"
                    name="password"
                    placeholder="Please enter your Password"
                    value={workerInput.password}
                    onChange={handleWorkerChange}
                    required
                /><br />
                <button onClick={handleWorkerLogin}>Enter</button>
            </div>
            <button onClick={() => (navigate('/'))}>Main Menu</button>
        </div>
    );
}
