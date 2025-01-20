import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ options, setOptions, handleDeleteOption, onClose }) => {
  const [newProfessor, setNewProfessor] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBranch, setNewBranch] = useState('');

  const addProfessor = () => {
    if (newProfessor.trim() !== '') {
      setOptions(prev => ({
        ...prev,
        professors: [...prev.professors, newProfessor],
      }));
      setNewProfessor('');
    }
  };

  const addSubject = () => {
    if (newSubject.trim() !== '') {
      setOptions(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject],
      }));
      setNewSubject('');
    }
  };

  const addBranch = () => {
    if (newBranch.trim() !== '') {
      setOptions(prev => ({
        ...prev,
        branches: [...prev.branches, newBranch],
      }));
      setNewBranch('');
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Manage Professors, Branches, Subjects</h1>
      <div className="button-container">
        <button onClick={onClose} className="close-button">Close</button>
      </div>

      <h3>Manage Professors</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Add Professor"
          value={newProfessor}
          onChange={(e) => setNewProfessor(e.target.value)}
        />
        <button onClick={addProfessor}>Add Professor</button>
      </div>
      <ul>
        {options.professors.map((professor, index) => (
          <li key={index}>
            {professor}{' '}
            <button onClick={() => handleDeleteOption('professors', index)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Manage Subjects</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Add Subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button onClick={addSubject}>Add Subject</button>
      </div>
      <ul>
        {options.subjects.map((subject, index) => (
          <li key={index}>
            {subject}{' '}
            <button onClick={() => handleDeleteOption('subjects', index)}>Delete</button>
          </li>
        ))}
      </ul>

      <h3>Manage Branches</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Add Branch"
          value={newBranch}
          onChange={(e) => setNewBranch(e.target.value)}
        />
        <button onClick={addBranch}>Add Branch</button>
      </div>
      <ul>
        {options.branches.map((branch, index) => (
          <li key={index}>{branch}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard; 

