const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const getDashboardData = async (token) => {
    try {
        const response = await fetch(`${apiUrl}/dashboard`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
    }
};