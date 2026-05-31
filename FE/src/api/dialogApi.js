// const dialgoApiUrl = import.meta.env.DIALOG_API_URL;
const dialogApiUrl = import.meta.env.DIALOG_API_URL;

export const fethchCallList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${dialogApiUrl}/api/v1/sales/calls?query=${encodeURIComponent(
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
    console.error("Error fetching calls:", error);
  }
};
