const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createSite = async (token, siteData) => {
  try {
    const response = await fetch(`${apiUrl}/sites`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(siteData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating site:", error);
  }
};

export const fechSitesList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${apiUrl}/sites?query=${encodeURIComponent(
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
    console.error("Error fetching sites:", error);
  }
};

export const fetchSiteById = async (token, siteId) => {
  try {
    const response = await fetch(`${apiUrl}/sites/${siteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching site:", error);
  }
};

export const deleteSite = async (token, siteId) => {
  try {
    const response = await fetch(`${apiUrl}/sites/${siteId}`, {
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


export const updateSite = async (token, siteId, siteData) => { 
  try {
    const response = await fetch(`${apiUrl}/sites`, { 
        method: "PUT",
        headers: {  
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(siteData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating site:", error);
  }
};
