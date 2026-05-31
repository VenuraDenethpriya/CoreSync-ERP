const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const fetchSalesList = async (token, query, status, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/sales?query=${encodeURIComponent(
        query
      )}&status=${encodeURIComponent(status)}&limit=${limit}&offset=${offset}`,
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
    console.log("Error fetching sales:", error);
  }
};

export const createSale = async (token, taskData) => {
  try {
    const response = await fetch(`${apiUrl}/sales`, {
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

export const getSaleById = async (token,saleId) => {
  try {
    const response = await fetch(`${apiUrl}/sales/${saleId}`, {
      method: "GET",
      headers: {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching sales:", error);
  }
};


export const updateSale = async (token, saleData) => {
  try {
    const response = await fetch(`${apiUrl}/sales`, {
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
    console.error("Error updating sale:", error);
  }
};

export const deleteSale = async (token, saleId) => {
  try {
    const response = await fetch(`${apiUrl}/sales/${saleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error deleting sale:", error);
  }
};

export const fetchSalesNoList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/sales/sale-list?query=${encodeURIComponent(
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
    console.log("Error fetching sales:", error);
  }
};
