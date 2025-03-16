import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function WorkerPage() {
    const [tasks, setTasks] = useState([]);
    const [taskHistory, setTaskHistory] = useState([]);
    const [deletedTasks, setDeletedTasks] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showDeletedTasks, setShowDeletedTasks] = useState(false);
    const [carLicenseNumber, setCarLicenseNumber] = useState('');
    const [taskName, setTaskName] = useState('');
    const [price, setPrice] = useState(0);
    const [workTime, setWorkTime] = useState(0);
    const workerName = localStorage.getItem('workerName');

    const navigate = useNavigate('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                if (!workerName) return;

                const response = await axios.get(`/worker-tasks-history/${workerName}`);
                const allTasks = response.data;

                const activeTasks = allTasks.filter(task => task.status === 'On Work');
                const finishedTasks = allTasks.filter(task => task.status === 'Finished');
                const deleted = allTasks.filter(task => task.status === 'Deleted');

                setTasks(activeTasks);
                setTaskHistory(finishedTasks);
                setDeletedTasks(deleted);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, [workerName]);

    const handleAddTask = async () => {
        try {
            const newTask = {
                taskName,
                price,
                workTime,
                carLicenseNumber,
                workerName
            };
            await axios.post('/tasks', newTask);

            const response = await axios.get(`/worker-tasks-history/${workerName}`);
            const allTasks = response.data;

            const activeTasks = allTasks.filter(task => task.status === 'On Work');
            setTasks(activeTasks);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleFinishTask = async (taskId) => {
        try {
            await axios.put(`/tasks/${taskId}`);

            const response = await axios.get(`/worker-tasks-history/${workerName}`);
            const allTasks = response.data;

            const activeTasks = allTasks.filter(task => task.status === 'On Work');
            const finishedTasks = allTasks.filter(task => task.status === 'Finished');

            setTasks(activeTasks);
            setTaskHistory(finishedTasks);
        } catch (error) {
            console.error('Error finishing task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.put(`/tasks/${taskId}/delete`);

            const response = await axios.get(`/worker-tasks-history/${workerName}`);
            const allTasks = response.data;

            const finishedTasks = allTasks.filter(task => task.status === 'Finished');
            const deleted = allTasks.filter(task => task.status === 'Deleted');

            setTaskHistory(finishedTasks);
            setDeletedTasks(deleted);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleToggleHistory = () => {
        setShowHistory(!showHistory);
    };

    const handleToggleDeletedTasks = () => {
        setShowDeletedTasks(!showDeletedTasks);
    };

    const handleExit = () => {
        localStorage.removeItem('workerName');
        navigate('/');
    }

    const calculateWorkTime = (tasks) => {
        const totalHours = tasks.reduce((total, task) => total + task.workTime, 0);
        const days = Math.floor(totalHours / 9);
        const hours = totalHours % 9;
        return { days, hours };
    };

    const assignedWorkTime = calculateWorkTime(tasks);
    const finishedWorkTime = calculateWorkTime(taskHistory);

    return (
        <div className="worker-page">
            <h2>{workerName}'s Work Page</h2>
            <div className="input-group">
                <h4>Enter Customer's License Number</h4>
                <input
                    style={{ textAlign: 'center' }}
                    type="text"
                    placeholder="Car License Number"
                    value={carLicenseNumber}
                    onChange={(e) => setCarLicenseNumber(e.target.value)}
                />
                <h4>Enter Task's Name</h4>
                <input
                    style={{ textAlign: 'center' }}
                    type="text"
                    placeholder="Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />
                <h4>Enter Price</h4>
                <input
                    style={{ textAlign: 'center' }}
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
                <h4>Enter Work Time</h4>
                <input
                    style={{ textAlign: 'center' }}
                    type="number"
                    placeholder="Work Time"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseFloat(e.target.value))}
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>

            <h3>Assigned Tasks</h3>
            <div className="section">
                <table>
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Car License Number</th>
                            <th>Cost</th>
                            <th>Work Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr key={task._id}>
                                    <td>{task.taskName}</td>
                                    <td>{task.carLicenseNumber}</td>
                                    <td>{task.price}$</td>
                                    <td>{task.workTime}h</td>
                                    <td>
                                        <button onClick={() => handleFinishTask(task._id)}>Finish</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No assigned tasks available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <h4>
                    Total Assigned Work Time: {assignedWorkTime.days} day
                    {assignedWorkTime.days !== 1 ? 's' : ''} and {assignedWorkTime.hours} hour
                    {assignedWorkTime.hours !== 1 ? 's' : ''}
                </h4>
            </div>

            <button onClick={handleToggleHistory}>
                {showHistory ? 'Hide History' : 'Show History'}
            </button>
            {showHistory && (
                <div className="section">
                    <h3>Task History</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Car License Number</th>
                                <th>Cost</th>
                                <th>Work Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskHistory.length > 0 ? (
                                taskHistory.map((task) => (
                                    <tr key={task._id}>
                                        <td>{task.taskName}</td>
                                        <td>{task.carLicenseNumber}</td>
                                        <td>{task.price}$</td>
                                        <td>{task.workTime}h</td>
                                        <td>
                                            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No finished tasks available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <h4>
                        Total Finished Work Time: {finishedWorkTime.days} day
                        {finishedWorkTime.days !== 1 ? 's' : ''} and {finishedWorkTime.hours} hour
                        {finishedWorkTime.hours !== 1 ? 's' : ''}
                    </h4>
                </div>
            )}

            <button onClick={handleToggleDeletedTasks}>
                {showDeletedTasks ? 'Hide Deleted Tasks' : 'Show Deleted Tasks'}
            </button>
            {showDeletedTasks && (
                <div className="section">
                    <h3>Deleted Tasks</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Car License Number</th>
                                <th>Cost</th>
                                <th>Work Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deletedTasks.length > 0 ? (
                                deletedTasks.map((task) => (
                                    <tr key={task._id}>
                                        <td>{task.taskName}</td>
                                        <td>{task.carLicenseNumber}</td>
                                        <td>{task.price}$</td>
                                        <td>{task.workTime}h</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No deleted tasks available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <button onClick={handleExit}>Exit</button>
        </div>
    );
}
