const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

// Api for creating new quote
export const createQuote = async (token,quoteData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(quoteData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating quote:", error);
  }
};

// Api for getting quotes list
export const fetchQuotesList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

// Api for getting quote by ID
export const fetchQuoteById = async (token, quoteId) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/${quoteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
};

// Api for updating quote
export const updateQuote = async (token, quoteId, quoteData) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/${quoteId}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(quoteData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Server returned an error:", data);
      throw new Error(data.message || "Failed to update quote");
    }
    
    return data;
  } catch (error) {
    console.error("Error updating quote:", error);
    throw error;
  }
};

//Api for update status
export const updateQuoteStatus = async (token,quoteId, status) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      credentials: "include",
      body: JSON.stringify({ quote_id: quoteId, status: status }),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating quote status:", error);
  }
};

// Api for fetching last quote no
export const featchLastQuoteNo = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/quote-no`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching last quote no:", error);
  }
};

export const featchLatestQuotNoType = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/type`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching last quote no:", error);
  }
}

// Get all quote details
export const getAllQuotesDetails = async (token, query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/quote-all?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

export const deleteQuote = async (token, id) => {
  try {
    const response = await fetch(`${apiUrl}/orders/quotes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response;
  } catch (error) {
    console.error("Error deleting quote:", error);
  }
};