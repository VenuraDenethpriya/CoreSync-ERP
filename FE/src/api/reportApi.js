const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const fetchReportData = async (token, type, startDate, endDate) => {
  try {
    const response = await fetch(
      `${apiUrl}/reports/${type}?start_date=${encodeURIComponent(startDate)}&end_date=${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching reports data:", error);
  }
};