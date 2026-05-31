const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const fethchTasksList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
        `${apiUrl}/tasks?query=${encodeURIComponent(
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
    console.error("Error fetching tasks:", error);
  }
};

export const createTask = async (token, taskData) => {
  try {
    const response = await fetch(`${apiUrl}/tasks`, {
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
    console.error("Error creating task:", error);
  }
};

export const updateTask = async (token, taskData) => {
  try {
    const response = await fetch(`${apiUrl}/tasks`, {
        method: "PUT",
        headers: {  
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(taskData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating task:", error);
  }
};

export const deleteTask = async (token, taskId) => {
  try {
    const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
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

export const fetchCardTasks = async (token, query, limit, offset) => {
  try {
    const response = await fetch(`${apiUrl}/tasks/card?query=${encodeURI(query)}&limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return response.json();
  } catch (error) {
    console.error("Error fetching all tasks:", error);
  }
} 

export const fetchTaskDetails = async (token, assigneeId, startDate, endDate) => {
  try {
    const response = await fetch(`${apiUrl}/tasks/report?assignee=${assigneeId}&start_date=${startDate}&end_date=${endDate}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching task details:", error);
  }
}