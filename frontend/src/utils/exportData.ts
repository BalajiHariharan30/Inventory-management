/**
 * Utility functions to export data array to CSV or JSON files
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  // Extract headers (keys of the first object)
  const headers = Object.keys(data[0]).join(',');
  
  // Format rows
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => {
        let str = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        str = str.replace(/"/g, '""');
        // Wrap in quotes if comma or newline present
        if (str.includes(',') || str.includes('\n') || str.includes('\r')) {
          str = `"${str}"`;
        }
        return str;
      })
      .join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
