import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import MyPage from './components/MyPage';
import WorkerPage from './components/WorkerPage';
import Main from './components/Main';
import CustomerSignUp from './components/CustomerSignUp';
import WorkerSignUp from './components/WorkerSignUp';
import ManagerPage from './components/ManagerPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/signup/customer" element={<CustomerSignUp />} />
          <Route path="/signup/worker" element={<WorkerSignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/workerpage" element={<WorkerPage />} />
          <Route path="/manager" element={<ManagerPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
