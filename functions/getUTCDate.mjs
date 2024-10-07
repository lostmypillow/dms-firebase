export const getUTCDate = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(now.getUTCDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  };
  