// components/ProgressBar.js
import React from 'react';
// Corrected import path: Assuming StaffDashboard.css is in MultipleFiles
import '../pages/StaffDashboard.css';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default ProgressBar;
