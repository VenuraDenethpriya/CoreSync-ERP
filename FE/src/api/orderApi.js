const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

// Api for creating new order
export const createOrder = async (token, orderData) => {
  try {
    const response = await fetch(`${apiUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

// Api for laste order type namd number
export const featchLatestOrderNoType = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/orders/type`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching last order type number:", error);
  }
};

// Api for getting all orders
export const featchAllOrders = async (
  token,
  query,
  vat,
  orderStatus,
  paymentStatus,
  limit,
  offset
) => {
  try {
    const response = await fetch(
      `${apiUrl}/orders?query=${encodeURI(query)}&vat=${encodeURI(
        vat
      )}&orderStatus=${encodeURI(orderStatus)}&paymentStatus=${encodeURI(
        paymentStatus
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
    console.error("Error fetching all orders:", error);
  }
};

export const updateOrder = async (token, orderId, data) => {
  try {
    const response = await fetch(`${apiUrl}/orders/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

export const updateOrderStatus = async (token, data) => {
  try {
    const response = await fetch(`${apiUrl}/orders`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

export const featchOrderById = async (token, orderId) => {
  try {
    const response = await fetch(`${apiUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching order by id:", error);
  }
};

export const deleteOrder = async (token, orderId) => {
  try {
    const response = await fetch(`${apiUrl}/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching order by id:", error);
  }
};

export const featchDraftOrders = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/orders/drafted?query=${encodeURI(
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
    console.error("Error fetching draft orders:", error);
  }
};

export const updateApproval = async (token, orderId, data) => {
  try {
    const response = await fetch(`${apiUrl}/orders/approvel/${orderId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating approval:", error);
  }
};

export const featchCadFile = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/orders/cad-files`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching CAD files:", error);
  }
};

export const featchCardOrders = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/orders/card?query=${encodeURI(
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
    console.error("Error fetching all orders:", error);
  }
};

export const orderPaymentsRefund = async (token, PaymentData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/refund`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PaymentData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating order payment refund", error);
  }
};

export const fetchAllBatteryPacks = async (token, query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/orders/packs?query=${encodeURI(
        query
      )}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching all packs:", error);
  }
};

export const featchPackById = async (token, packId) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack/${packId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching pack by id:", error);
  }
};

export const updatePack = async (token, PackData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PackData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating pack", error);
  }
};

export const updatePackOrderID = async (token, PackData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack/order-no`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PackData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating pack", error);
  }
};

export const createPack = async (token, PackData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PackData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating pack", error);
  }
};

export const fetchPayments = async (
  token,
  query,
  limit,
  offset
) => {
  try {
    const response = await fetch(
      `${apiUrl}/orders/payments?query=${encodeURI(query)}&limit=${limit}&offset=${offset}`,
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
    console.error("Error fetching payments:", error);
  }
};

export const updatePayment = async (token, PaymentData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/payment`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PaymentData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating payment", error);
  }
};

export const updatePackProduction = async (token, PackData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack/production`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(PackData),
    });
    return response?.json();
  } catch (error) {
    console.log("Error updating pack", error);
  }
};

export const deletePack = async (token, packId) => {
  try {
    const response = await fetch(`${apiUrl}/orders/pack/${packId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error deleting pack by id:", error);
  }
};