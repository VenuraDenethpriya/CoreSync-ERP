const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createRepair = async (token, repairData) => {
  try {
    const response = await fetch(`${apiUrl}/repairs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(repairData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating repair:", error);
  }
};

export const fetchRepairsList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/repairs?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching repairs:", error);
  }
};

export const fetchRepairById = async (token, repairId) => {
  try {
    const response = await fetch(`${apiUrl}/repairs/${repairId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching repair:", error);
  }
};

export const updateRepair = async (token, repairId, repairData) => {
  try {
    const response = await fetch(`${apiUrl}/repairs/${repairId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(repairData),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating repair:", error);
  }
};

export const deleteRepair = async (token, repairId) => {
  try {
    const response = await fetch(`${apiUrl}/repairs/${repairId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting repair:", error);
  }
};
export const fetchLastJobNo = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/repairs/last-job-no`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching last job no:", error);
  }
};

export const createRepairItemUsage = async (token, itemUsageData) => {
  try {
    const response = await fetch(`${apiUrl}/repairs/repair-usage`, {
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
    console.error("Error creating repair item usage:", error);
  }
};

export const featchRepairUsage = async (token, { jobId, itemId,limit, offset }) => {
  try {
    const queryParams = new URLSearchParams();
    if (jobId) queryParams.append("job_id", jobId);
    if (itemId) queryParams.append("item_id", itemId);

    const response = await fetch(`${apiUrl}/repairs/usage?${queryParams.toString()}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return response?.json();
  } catch (error) {
    console.error("Error fetching repair usage:", error);
  }
};