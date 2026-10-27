const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

// Api for creating new casing
export const createCasing = async (token, casingData) => {
  try {
    const response = await fetch(`${apiUrl}/productions/casing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(casingData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating casing:", error);
  }
};

export const fetchCasingsList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/productions/casing?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
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
    console.error("Error fetching casings:", error);
  }
};

export const createWireHarness = async (token, wireHarnessData) => {
  try {
    const response = await fetch(`${apiUrl}/productions/wire-harness`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(wireHarnessData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating wire harness:", error);
  }
};

export const fetchWireHarnessList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/productions/wire-harness?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
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
    console.error("Error fetching wire harness:", error);
  }
};

