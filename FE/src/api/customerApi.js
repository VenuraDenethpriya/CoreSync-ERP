const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;
export const getCustomerTableData = async () => {
  try {
    const response = await fetch(`${apiUrl}/customers/table`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

export const createCustomer = async (token,payload) => {
  try {
    const response = await fetch(`${apiUrl}/customers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating customer:", error);
  }
};


export const searchCustomers = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/customers/search?query=${encodeURIComponent(
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
    return response.json();
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

export const getCustomerById = async (token,customerId) => {
  try {
    const response = await fetch(`${apiUrl}/customers/${customerId}`, {
      method: "GET",
      headers: {
         Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching customer:", error);
  }
};

export const deleteCustomer = async (token,customerId) => {
  try {
    const response = await fetch(`${apiUrl}/customers/${customerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

export const updateCustomer = async (token,customerData) => {
  try {
    const response = await fetch(`${apiUrl}/customers`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(customerData),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating customer:", error);
  }
};


export const getCuestomerByPhoneNo = async (token, phone) => {
  try {
    const response = await fetch(`${apiUrl}/customers/phone/${phone}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
  }
};