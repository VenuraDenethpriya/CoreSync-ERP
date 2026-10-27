const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createInventoryItem = async (token,inventoryItemData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryItemData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating inventory item:", error);
  }
};

export const fetchInventoryItemsList = async (token, query, limit, offset, sellable) => {
  try {
    const params = new URLSearchParams({
      query: query || "",
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (sellable !== undefined && sellable !== null && sellable !== "") {
      params.append("sellable", sellable.toString());
    }

    const response = await fetch(`${apiUrl}/inventory?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await response.json();
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error; 
  }
};

export const updateInventoryItem = async (token,inventoryItemData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryItemData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating inventory item:", error);
  }
};

export const deleteInventoryItem = async (token,itemId) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error deleting inventory item:", error);
  }
};

export const fetchInventoryItemById = async (token,itemId) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/${itemId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory item by id:", error);
  }
};

export const createInventoryUsage = async (token, itemUsageData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/usage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(itemUsageData),
    });
    return response?.json();
  }
  catch (error) {
    console.error("Error creating inventory usage:", error);
  }
};

export const featchInventoryUsage = async (token, { orderId, itemId, packId, limit, offset }) => {
  try {
    const queryParams = new URLSearchParams();
    if (orderId) queryParams.append("order_id", orderId);
    if (itemId) queryParams.append("item_id", itemId);
    if (packId) queryParams.append("pack_id", packId);

    const response = await fetch(`${apiUrl}/inventory/usage?${queryParams.toString()}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory usage:", error);
  }
};

export const deleteInventoryUsage = async (token, usageData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/usage`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(usageData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error deleting inventory usage:", error);
  }
};

export const updateInventoryUsageCount = async (token, usageData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/usage`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(usageData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating inventory usage:", error);
  }
};

export const featchNonResellableInventory = async (token, query, limit) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/nonresellable?query=${encodeURIComponent(query)}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching non-resellable inventory:", error);
  }
};

export const creatInventoryRestock = async (token, inventoryRestockData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/restock`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryRestockData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating inventory restock:", error);
  }
};

export const featchInventoryRestock = async (token, { itemId, limit, offset }) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/restock/${itemId}?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory restock:", error);
  }
};

export const createInventoryAllocation = async (token, inventoryAllocationData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/allocation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryAllocationData),
    });
    return response?.json(); 
  }
  catch (error) {
    console.error("Error creating inventory allocation:", error);
  }
}

export const featchInventoryAllocation = async (token, { orderId, itemId, packId, limit, offset }) => {
  try {
    const queryParams = new URLSearchParams();
    if (orderId) queryParams.append("order_id", orderId);
    if (itemId) queryParams.append("item_id", itemId);
    if (packId) queryParams.append("pack_id", packId);

    const response = await fetch(`${apiUrl}/inventory/allocation?${queryParams.toString()}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory allocation:", error);
  }
};

export const deleteInventoryAllocation = async (token, id) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/allocation`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(id),
    });
    return response?.json();
  } catch (error) {
    console.error("Error deleting inventory usage:", error);
  }
};


export const updateInventoryAllocationCount = async (token, allocationData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/allocation`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(allocationData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating inventory allocation:", error);
  }
};

export const fetchInventoryItemByCode = async (token, query) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/item?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory items by  code:", error);
  }
};

export const updateInventoryRestockPrintStatus = async (token, restockData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/restock`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(restockData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating inventory restock print status:", error);
  }
};

export const createInventoryOrderItem = async (token, inventoryOrderData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryOrderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating inventory order:", error);
  }
};

export const fetchInventoryOrdersList = async (token,query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/orders?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory orders:", error);
  }
};

export const deleteInventoryOrder = async (token,orderId) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error deleting inventory order:", error);
  }
};

export const updateInventoryOrder = async (token,inventoryOrderData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/orders`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryOrderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating inventory item:", error);
  }
};

export const fetchInventoryReceivedOrdersList = async (token,query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/orders/received?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching inventory orders:", error);
  }
};
export const createInventoryFromOrder = async (token, inventoryOrderData) => {
  try {
    const response = await fetch(`${apiUrl}/inventory/orders/received`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(inventoryOrderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating inventory order:", error);
  }
};
