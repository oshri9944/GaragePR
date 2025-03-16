import React, { useState } from 'react';
import axios from 'axios';

export default function ManagerPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterWorker, setFilterWorker] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [workerDetails, setWorkerDetails] = useState([]);
    const [customerDetails, setCustomerDetails] = useState([]);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            fetchTasks();
            fetchWorkerDetails();
            fetchCustomerDetails();
        } else {
            alert('Incorrect password');
        }
    };

    const fetchTasks = async () => {
        try {
            const customerResponse = await axios.get('/all-customer-tasks');
            const workerResponse = await axios.get('/all-worker-tasks');

            const allTasks = customerResponse.data.flatMap(customer =>
                customer.tasks.map(task => {
                    const associatedWorker = workerResponse.data.find(worker =>
                        worker.tasksHistory.some(wTask => wTask._id === task._id)
                    );

                    return {
                        ...task,
                        licenseNumber: customer.licenseNumber,
                        workerName: associatedWorker ? associatedWorker.userName : 'Unassigned',
                    };
                })
            );

            setTasks(allTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchWorkerDetails = async () => {
        try {
            const response = await axios.get('/worker-details');
            setWorkerDetails(response.data);
        } catch (error) {
            console.error('Error fetching worker details', error);
        };
    };

    const fetchCustomerDetails = async () => {
        try {
            const response = await axios.get('/customer-details');
            setCustomerDetails(response.data);
        } catch (error) {
            console.error('Error fetching customer details', error);
        };
    };

    const refreshTasks = async () => {
        try {
            await fetchTasks();
        } catch (error) {
            console.error('Failed to refresh tasks:', error)
        }
    }

    const calculateTotalCost = tasks =>
        tasks.reduce((total, task) => total + task.price, 0);

    const calculateWorkTime = tasks => {
        const totalHours = tasks.reduce((total, task) => total + task.workTime, 0);
        const days = Math.floor(totalHours / 9);
        const hours = totalHours % 9;
        return { days, hours };
    };

    const filteredTasks = tasks.filter(task =>
        (task.licenseNumber.includes(searchTerm) ||
            task.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.taskName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus ? task.status === filterStatus : true) &&
        (filterWorker ? task.workerName === filterWorker : true)
    );

    const handleTaskSelect = (task, isSelected) => {
        setSelectedTasks(prev =>
            isSelected
                ? [...prev, task]
                : prev.filter(selectedTask => selectedTask !== task)
        );
    };

    const handleSelectAll = (isSelected) => {
        setSelectedTasks(isSelected ? filteredTasks : []);
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedTasks.length === 0) {
            alert('Please select an action and tasks.');
            return;
        }

        try {
            if (bulkAction === 'Deleted') {
                for (let task of selectedTasks) {
                    await axios.put(`/tasks/${task._id}/delete`);
                }
            } else {
                for (let task of selectedTasks) {
                    await axios.post('/update-task-status', { taskId: task._id, status: bulkAction });
                }
            }

            fetchTasks();
            setSelectedTasks([]);
            setBulkAction('');
            alert('Bulk action applied successfully!');
        } catch (error) {
            console.error('Error applying bulk action:', error);
            alert('Failed to apply bulk action.');
        }
    };


    if (!isAuthenticated) {
        return (
            <div>
                <h2>Manager Access</h2>
                <form onSubmit={handlePasswordSubmit}>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit">Submit</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h2>Manager Page</h2>
            <button onClick={refreshTasks} className='refresh-button'>Refresh Tasks</button><br />
            <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ marginBottom: '10px', padding: '5px', width: '200px' }}
            />

            <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
            >
                <option value="">All Statuses</option>
                <option value="On Work">On Work</option>
                <option value="Finished">Finished</option>
                <option value="Deleted">Deleted</option>
            </select>

            <select
                value={filterWorker}
                onChange={e => setFilterWorker(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
            >
                <option value="">All Workers</option>
                {Array.from(new Set(tasks.map(task => task.workerName))).map(worker => (
                    <option key={worker} value={worker}>
                        {worker}
                    </option>
                ))}
            </select>

            <div style={{ marginTop: '10px' }}>
                <select
                    value={bulkAction}
                    onChange={e => setBulkAction(e.target.value)}
                    style={{ padding: '5px', marginRight: '10px' }}
                >
                    <option value="">Bulk Action</option>
                    <option value="On Work">Set to On Work</option>
                    <option value="Finished">Set to Finished</option>
                    <option value="Deleted">Delete</option>
                </select>
                <button onClick={handleBulkAction} style={{ padding: '5px' }}>
                    Apply
                </button>
            </div>

            <table border="1" cellPadding="5" cellSpacing="0" style={{ marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                onChange={e => handleSelectAll(e.target.checked)}
                                checked={selectedTasks.length === filteredTasks.length}
                            />
                        </th>
                        <th>Worker Name</th>
                        <th>License Number</th>
                        <th>Task Name</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Work Time</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTasks.map((task, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedTasks.includes(task)}
                                    onChange={e => handleTaskSelect(task, e.target.checked)}
                                />
                            </td>
                            <td>{task.workerName}</td>
                            <td>{task.licenseNumber}</td>
                            <td>{task.taskName}</td>
                            <td>{task.status}</td>
                            <td>{task.price}</td>
                            <td>{task.workTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px' }}>
                <p>Total Cost: ${calculateTotalCost(filteredTasks)}</p>
                <p>
                    Total Work Time: {calculateWorkTime(filteredTasks).days} days and{' '}
                    {calculateWorkTime(filteredTasks).hours} hours
                </p>
            </div>
            <div>
                <h3>Worker Details</h3>
                <table border="1" cellPadding="5" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Worker Name</th>
                            <th>On Work Tasks</th>
                            <th>Finished Tasks</th>
                            <th>Deleted Tasks</th>
                            <th>Total Work Time (hrs)</th>
                            <th>Total Task Price ($)</th>
                            <th>Average Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workerDetails.map((worker, index) => (
                            <tr key={index}>
                                <td>{worker.workerName}</td>
                                <td>{worker.onWorkCount}</td>
                                <td>{worker.finishedCount}</td>
                                <td>{worker.deletedCount}</td>
                                <td>{worker.totalWorkTime}</td>
                                <td>{worker.totalTaskPrice}</td>
                                <td>{worker.averageRating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3>Customer Details</h3>
                <table border="1" cellPadding="5" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>License Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customerDetails.map((customer, index) => (
                            <tr key={index}>
                                <td>{customer.name}</td>
                                <td>{customer.licenseNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
