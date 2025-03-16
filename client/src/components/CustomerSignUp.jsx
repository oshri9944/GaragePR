import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerSignUp() {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        licenseNumber: ''
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
            await axios.post('/signup/customer', formData);
            alert('Customer Sign-Up Successful');
            navigate('/');
        } catch (error) {
            console.error('Error during Sign-Up', error);
        };
    };

    return (
        <div>
            <h1>Customer Sign Up</h1>
            <input type="text" name='userName' placeholder='Please Enter User Name' value={formData.userName}
                onChange={handleChange} required /><br />
            <input type="email" name='email' placeholder='Please Enter Email' value={formData.email}
                onChange={handleChange} required /><br />
            <input type="password" name='password' placeholder='Please Enter Password' value={formData.password}
                onChange={handleChange} required /><br />
            <input type="text" name='licenseNumber' placeholder='Please Enter Car License Number' value={formData.licenseNumber}
                onChange={handleChange} required /><br />
            <button onClick={handleSignUp}>Sign Up</button><br />
            <button onClick={() => (navigate('/'))}>Main Menu</button>
        </div>
    );
};
