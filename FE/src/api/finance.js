const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createPurchaseOrder = async (token, purchaseOrderData) => {
  try {
    const response = await fetch(`${apiUrl}/finance`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(purchaseOrderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating purchase order:", error);
  }
};

export const fechPurchaseOrdersList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${apiUrl}/finance?query=${encodeURIComponent(
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
    console.error("Error fetching purchase orders:", error);
  }
};

export const fechPurchaseOrderById = async (token, purchaseOrderId) => {
  try {
    const response = await fetch(`${apiUrl}/finance/${purchaseOrderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching purchase orders by id:", error);
  }
};

export const deletePurchaseOrder = async (token, purchaseOrderId) => {
  try {
    const response = await fetch(`${apiUrl}/finance/${purchaseOrderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.log("Error deleting data:", error)
  }
}

export const updatePurchaseOrder = async (token, purchaseOrderData) => { 
  try {
    const response = await fetch(`${apiUrl}/finance`, { 
        method: "PUT",
        headers: {  
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(purchaseOrderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating site:", error);
  }
};

export const fechListName = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${apiUrl}/finance/items?query=${encodeURIComponent(
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
    console.error("Error fetching items list:", error);
  }
};