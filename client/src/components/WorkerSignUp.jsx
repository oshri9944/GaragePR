import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function WorkerSignUp() {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignUp = async () => {
        try {
            await axios.post('/signup/worker', formData);
            alert('Worker sign-up successful!');
            navigate('/');
        } catch (error) {
            console.error('Error during sign-up', error);
        }
    };

    return (
        <div>
            <h1>Worker Sign Up</h1>
            <input type="text" name="userName" placeholder="User Name" value={formData.userName} onChange={handleChange} required /><br />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required /><br />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required /><br />
            <button onClick={handleSignUp}>Sign Up</button><br />
            <button onClick={() => (navigate('/'))}>Main Menu</button>
        </div>
    );
};
