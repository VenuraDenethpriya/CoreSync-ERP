const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const featchAuditLogs = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/settings/logs?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        Credential: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error feaching audit logs:", error);
  }
};

export const createAuditLog = async (token, logData) => {
  try {
    const response = await fetch(`${apiUrl}/settings/logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(logData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
