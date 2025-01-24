export const parseCSV = (text) => {
  const lines = text.split('\n');
  const students = lines.map(line => {
    const [name, rollNumber] = line.split(','); // Adjust based on your CSV structure
    return { name, rollNumber }; // Return an object for each student
  });
  return students;
};

export const parseExcelData = (data) => {
  return data.map(row => row.map(col => col ? col.trim() : null));
}; 