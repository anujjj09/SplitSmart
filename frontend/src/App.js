import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups/:groupId" element={<GroupDetails />} />
            </Routes>
          </div>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;