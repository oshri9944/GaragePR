import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MyPage() {
    const [onWorkTasks, setOnWorkTasks] = useState([]);
    const [finishedTasks, setFinishedTasks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedRating, setSelectedRating] = useState({});

    const carLicenseNumber = localStorage.getItem('licenseNumber');
    const userName = localStorage.getItem('userName');
    const navigate = useNavigate();

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get(`/user-tasks/${carLicenseNumber}`);
            const tasks = Array.isArray(response.data) ? response.data : [];

            setOnWorkTasks(tasks.filter(task => task.status === 'On Work'));
            setFinishedTasks(tasks.filter(task => task.status === 'Finished'));
            setTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setOnWorkTasks([]);
            setFinishedTasks([]);
            setTasks([]);
        }
    }, [carLicenseNumber]);

    useEffect(() => {
        if (carLicenseNumber) {
            fetchTasks();
        } else {
            console.error('No license number found in localStorage');
        }
    }, [carLicenseNumber, fetchTasks]);

    const handleRatingChange = (taskId, rating) => {
        setSelectedRating({ ...selectedRating, [taskId]: rating });
    };

    const submitRating = async (taskId) => {
        const rating = selectedRating[taskId];
        if (!rating) {
            alert('Please select a rating before submitting.');
            return;
        }

        try {
            await axios.post(`/rate-task/${taskId}`, { rating });
            fetchTasks();
        } catch (error) {
            console.error('Error rating task:', error.response?.data || error.message);
        }
    };


    const calculateTotalCost = (tasks) => tasks.reduce((total, task) => total + task.price, 0);

    const calculateWorkTime = (tasks) => {
        const totalHours = tasks.reduce((total, task) => total + task.workTime, 0);
        const days = Math.floor(totalHours / 9);
        const hours = totalHours % 9;
        return { days, hours };
    };

    const handleExit = () => {
        localStorage.removeItem('licenseNumber');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const totalCost = calculateTotalCost([...onWorkTasks, ...finishedTasks]);
    const { days, hours } = calculateWorkTime([...onWorkTasks, ...finishedTasks]);

    return (
        <div className="worker-page">
            <div className="section">
                <h1>{`Welcome, ${userName}, to your page`}</h1>

                <h2>On Work Tasks</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Cost</th>
                            <th>Work Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {onWorkTasks.length > 0 ? (
                            onWorkTasks.map(task => (
                                <tr key={task._id}>
                                    <td>{task.taskName}</td>
                                    <td>{task.price}$</td>
                                    <td>{task.workTime}h</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No on-work tasks available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <h2>Finished Tasks</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Cost</th>
                            <th>Work Time</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finishedTasks.length > 0 ? (
                            finishedTasks.map(task => (
                                <tr key={task._id}>
                                    <td>{task.taskName}</td>
                                    <td>{task.price}$</td>
                                    <td>{task.workTime}h</td>
                                    <td>
                                        <select
                                            value={selectedRating[task._id] || ''}
                                            onChange={(e) => handleRatingChange(task._id, e.target.value)}
                                        >
                                            <option value="">Rate this task</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                            <option value="5">5</option>
                                        </select>
                                        <button onClick={() => submitRating(task._id)}>Rate</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No finished tasks available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <h3>Total Cost: {totalCost}$</h3>
                <h3>Total Work Time: {days} day{days !== 1 ? 's' : ''} and {hours} hour{hours !== 1 ? 's' : ''}</h3>
                <button onClick={handleExit}>Exit</button>
            </div>
        </div>
    );
}
