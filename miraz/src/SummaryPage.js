import React from "react";
import * as XLSX from "xlsx";
import './SummaryPage.css';

function SummaryPage({ detainedStudents, classDetails, onBack }) {
  const handleExportToExcel = () => {
    const worksheetData = [
      [
        "Roll Number",
        "Student Name",
        "Branch",
        "Section",
        ...classDetails.subjects.map(subject => `${subject.name} Attendance`),
        "Overall Percentage"
      ],
      ...detainedStudents.map(student => [
        student.rollNumber,
        student.name,
        classDetails.branch,
        classDetails.section,
        ...classDetails.subjects.map(subject => 
          `${student.attendance[subject.name]}/${subject.totalLectures} (${((student.attendance[subject.name] / subject.totalLectures) * 100).toFixed(1)}%)`
        ),
        student.percentage.toFixed(2) + "%"
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
        <h1>Detained Students Summary</h1>
        <p>Students with attendance below 75% in any subject</p>
      </div>

      <div className="summary-table">
        <div className="table-header">
          <span>Roll Number</span>
          <span>Student Name</span>
          <span>Branch</span>
          <span>Section</span>
          {classDetails.subjects.map((subject, index) => (
            <span key={index}>{subject.name}</span>
          ))}
          <span>Overall %</span>
        </div>
        <div className="table-body">
          {detainedStudents.map((student, index) => (
            <div className="table-row" key={index}>
              <span>{student.rollNumber}</span>
              <span>{student.name}</span>
              <span>{classDetails.branch}</span>
              <span>{classDetails.section}</span>
              {classDetails.subjects.map((subject, subIndex) => {
                const attendance = student.attendance[subject.name];
                const percentage = (attendance / subject.totalLectures) * 100;
                return (
                  <span 
                    key={subIndex} 
                    className={percentage < 75 ? 'low-attendance' : ''}
                  >
                    {attendance}/{subject.totalLectures}
                    <br />
                    ({percentage.toFixed(1)}%)
                  </span>
                );
              })}
              <span className={student.percentage < 75 ? 'low-attendance' : ''}>
                {student.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-footer">
        <p>Note: Highlighted values indicate attendance below 75%</p>
      </div>

      <div className="action-buttons">
        <button className="btn-excel" onClick={handleExportToExcel}>Export to Excel</button>
        <button className="btn-back" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

export default SummaryPage;