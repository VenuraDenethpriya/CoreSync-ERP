const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const fetchCallsList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/sales/calls?query=${encodeURIComponent(
        query
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    return response?.json();
  } catch (error) {
    console.log("Error fetching calls:", error);
  }
};
