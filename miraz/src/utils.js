export const parseCSV = (data) => {
  const rows = data.split("\n");
  return rows.map(row => row.split(",").map(col => col.trim()));
};

export const parseExcelData = (data) => {
  return data.map(row => row.map(col => col ? col.trim() : null));
}; 