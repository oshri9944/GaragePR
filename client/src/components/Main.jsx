import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Main() {

    const navigate = useNavigate('');

    return (
        <div>
            <h1>Hello and Welcome to our Garage!<br />Please Sign Up or Sign In</h1>
            <button onClick={() => { navigate('/signup/worker') }}>Worker Sign-Up</button><br />
            <button onClick={() => { navigate('/signup/customer') }}>Customer Sign-Up</button><br />
            <button onClick={() => { navigate('/signin') }}>Sign In</button><br />
        </div>
    )
};
