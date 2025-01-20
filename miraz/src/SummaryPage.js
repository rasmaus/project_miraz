import React from "react";
import * as XLSX from "xlsx";
import './SummaryPage.css'; // Import the CSS file for styling

function SummaryPage({ detainedStudents, classDetails, onBack }) {
  const handleExportToExcel = () => {
    const worksheetData = [
      ["Student Name", "Attendance Percentage", "Subject", "Branch", "Section"],
      ...detainedStudents.map(student => [
        student.name,
        student.percentage.toFixed(2) + "%",
        classDetails.subject,
        classDetails.branch,
        classDetails.section
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detained Students");
    XLSX.writeFile(workbook, "Detained_Students_Summary.xlsx");
  };

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h1>Detained Students</h1>
      </div>

      <div className="summary-table">
        <div className="table-header">
          <span>Student Name</span>
          <span>Attendance Percentage</span>
          <span>Subject</span>
          <span>Branch</span>
          <span>Section</span>
        </div>
        <div className="table-body">
          {detainedStudents.map(student => (
            <div className="table-row" key={student.name}>
              <span>{student.name}</span>
              <span>{student.percentage.toFixed(1)}%</span>
              <span>{classDetails.subject}</span>
              <span>{classDetails.branch}</span>
              <span>{classDetails.section}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-excel" onClick={handleExportToExcel}>SAVE SHEET</button>
        <button className="btn-back" onClick={onBack}>BACK</button>
      </div>
    </div>
  );
}

export default SummaryPage; 