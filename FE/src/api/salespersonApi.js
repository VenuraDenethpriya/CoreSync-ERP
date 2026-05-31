const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const fethchSalespersonList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${apiUrl}/sales/salespersons?query=${encodeURIComponent(
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
    console.error("Error fetching salespersons:", error);
  }
};

export const fethchSalespersonNames = async (token) => {
  try {
    const response = await fetch(
        `${apiUrl}/sales/salespersons/salespersons-list`,
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
    console.error("Error fetching salespersons:", error);
  }
};

export const createSalespereson = async (token, taskData) => {
  try {
    const response = await fetch(`${apiUrl}/sales/salespersons`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(taskData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating sale:", error);
  }
};

export const getSalespersonById = async (token,salespersonId) => {
  try {
    const response = await fetch(`${apiUrl}/sales/salespersons/${salespersonId}`, {
      method: "GET",
      headers: {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching salesperson:", error);
  }
};

export const updateSalesperson = async (token, saleData) => {
  try {
    const response = await fetch(`${apiUrl}/sales/salespersons`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(saleData),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating salesperson:", error);
  }
};


export const deleteSalesperson = async (token, salespersonId) => {
  try {
    const response = await fetch(`${apiUrl}/sales/salespersons/${salespersonId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error deleting salesperson:", error);
  }
};

export const fetchSalesByDateRange = async (token, salespersonId, fromDate, toDate) => {
  try {
    const response = await fetch(
      `${apiUrl}/sales/salespersons/get-by-range?salesperson_id=${salespersonId}&start_date=${fromDate}&end_date=${toDate}`,
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
    console.log("Error fetching sales by date range:", error);
  }
};