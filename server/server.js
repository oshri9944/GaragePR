require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.connect('', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    tasksHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    }
});

const workerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tasksHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

const taskSchema = new mongoose.Schema({
    carLicenseNumber: String,
    taskName: String,
    status: {
        type: String,
        enum: ['On Work', 'Finished', 'Deleted'],
        default: 'On Work'
    },
    price: Number,
    workTime: Number,
    workerName: String,
    rating: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Worker = mongoose.model('Worker', workerSchema);
const Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Garage Server is Running');
});

app.get('/tasks', async (req, res) => {
    const { licenseNumber, status } = req.query;
    try {
        const tasks = await Task.find({
            carLicenseNumber: licenseNumber,
            ...(status && { status })
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/user-tasks/:licenseNumber', async (req, res) => {
    const { licenseNumber } = req.params;

    try {
        const user = await User.findOne({ licenseNumber }).populate('tasks');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.tasks);
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

app.get('/worker-tasks-history/:workerName', async (req, res) => {
    const { workerName } = req.params;
    console.log('Received request for worker tasks history:', workerName);

    try {
        const worker = await Worker.findOne({ userName: workerName }).populate('tasksHistory');
        console.log('Worker found:', worker);

        if (!worker) {
            console.log('Worker not found');
            return res.status(404).json({ message: 'Worker not found' });
        }

        console.log('Sending task history:', worker.tasksHistory);
        res.status(200).json(worker.tasksHistory);
    } catch (error) {
        console.error('Error fetching worker tasks history:', error);
        res.status(500).json({ message: 'Failed to fetch worker tasks history' });
    }
});

app.get('/all-customer-tasks', async (req, res) => {
    try {
        const customers = await User.find().populate({
            path: 'tasks',
            model: 'Task'
        });

        console.log('Populated Customer Tasks:', customers);

        res.json(customers);
    } catch (error) {
        console.error('Error fetching all customer tasks:', error);
        res.status(500).json({ message: 'Failed to fetch customer tasks' });
    }
});

app.get('/all-worker-tasks', async (req, res) => {
    try {
        const workers = await Worker.find().populate({
            path: 'tasksHistory',
            model: 'Task'
        });

        console.log('Populated Worker Tasks:', workers);

        res.json(workers);
    } catch (error) {
        console.error('Error fetching all worker tasks:', error);
        res.status(500).json({ message: 'Failed to fetch worker tasks' });
    }
});

app.get('/worker-details', async (req, res) => {
    try {
        const workers = await Worker.find().populate('tasksHistory');

        const workerStats = workers.map(worker => {
            const onWorkTasks = worker.tasksHistory.filter(task => task.status === 'On Work');
            const finishedTasks = worker.tasksHistory.filter(task => task.status === 'Finished');
            const deletedTasks = worker.tasksHistory.filter(task => task.status === 'Deleted');

            const totalWorkTime = worker.tasksHistory.reduce((total, task) => total + (task.workTime || 0), 0);
            const totalTaskPrice = worker.tasksHistory.reduce((total, task) => total + (task.price || 0), 0);
            const averageRating = finishedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / (finishedTasks.length || 1);

            return {
                workerName: worker.userName,
                onWorkCount: onWorkTasks.length,
                finishedCount: finishedTasks.length,
                deletedCount: deletedTasks.length,
                totalWorkTime,
                totalTaskPrice,
                averageRating: averageRating.toFixed(2) || 0
            };
        });

        res.json(workerStats);
    } catch (error) {
        console.error('Error fetching worker details', error);
        res.status(500).json({ message: 'Failed to fetch worker details' });
    }
});

app.get('/customer-details', async (req, res) => {
    try {
        const customers = await User.find();
        const customerDetails = customers.map(customer => ({
            name: customer.userName,
            licenseNumber: customer.licenseNumber,
        }));
        res.json(customerDetails);
    } catch (error) {
        console.error('Error fetching customer details', error);
        res.status(500).json({ message: 'Failed to fetch customer details' });
    };
});

app.post('/tasks', async (req, res) => {
    const { taskName, price, workTime, carLicenseNumber, workerName } = req.body;
    console.log('Adding new task for worker:', workerName, 'with details:', req.body);

    try {
        const task = new Task({ taskName, price, workTime, carLicenseNumber, workerName });
        await task.save();

        console.log('New task saved:', task);

        let worker;
        worker = await Worker.findOneAndUpdate(
            { userName: workerName },
            { $push: { tasksHistory: task._id } },
            { new: true }
        );

        console.log('Worker after adding task:', worker);

        const customer = await User.findOneAndUpdate(
            { licenseNumber: carLicenseNumber },
            { $push: { tasks: task._id } },
            { new: true }
        );

        console.log('Customer after adding task:', customer);
        res.status(201).json(task);
    } catch (error) {
        console.error('Error adding new task:', error);
        res.status(500).json({ message: 'Failed to add task' });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task == null) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = 'Finished';
        await task.save();

        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.status = 'Deleted';
        await task.save();
        res.json({ message: 'Task deleted successfully' });
        console.log(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/tasks/:id/delete', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = 'Deleted';
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/signin', async (req, res) => {
    const { userName, password } = req.body;

    try {
        const user = await User.findOne({ userName, password });
        if (user) {
            res.json({ message: 'ok', licenseNumber: user.licenseNumber });
        } else {
            res.status(401).json({ message: 'not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/signin/worker', async (req, res) => {
    const { userName, password } = req.body;

    try {
        const worker = await Worker.findOne({ userName, password });
        if (worker) {
            res.json({ message: 'ok', workerName: worker.userName });
        } else {
            res.status(401).json({ message: 'not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/signup/customer', async (req, res) => {
    const { userName, email, password, licenseNumber } = req.body;
    try {
        let user = await User.findOne({ userName });
        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        user = new User({ userName, email, password, licenseNumber });
        await user.save();
        res.status(201).json({ message: 'Customer sign-up successful!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/signup/worker', async (req, res) => {
    const { userName, email, password } = req.body;
    try {
        let worker = await Worker.findOne({ userName });
        if (worker) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        worker = new Worker({ userName, email, password });
        await worker.save();
        res.status(201).json({ message: 'Worker sign-up successful!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/update-task-status', async (req, res) => {
    const { taskId, status } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        task.status = status;
        await task.save();

        res.status(200).json({ message: 'Task status updated succuessfully', task });
    } catch (error) {
        console.error('Error updating task status', error);
        res.status(500).json({ message: 'Failed to update task status' });
    };
});

app.post('/rate-task/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { rating } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID format' });
        }

        const task = await Task.findByIdAndUpdate(taskId, { rating }, { new: true });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task rated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Error rating task', error: error.message });
    }
});


const path = require('path');

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Server is running on port ${port}`); });
