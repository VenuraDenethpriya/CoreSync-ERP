const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createUser = async (token, userData) => {
  try {
    const response = await fetch(`${apiUrl}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    return response.json();
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

export const fetchUsersList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/users?query=${encodeURIComponent(
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
    console.error("Error fetching users:", error);
  }
};

export const updateUser = async (token, userData) => {
  try {
    const response = await fetch(`${apiUrl}/users`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const deleteUser = async (token, userId) => {
  try {
    const response = await fetch(`${apiUrl}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const createClerkUser = async (
  token,
  FirstName,
  LastName,
  Email,
  PhoneNo,
  Password,
  Role
) => {
  try {
    const clerkResponse = await fetch(`${apiUrl}/users/clerk/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: FirstName,
        last_name: LastName,
        email: Email,
        phone_no: PhoneNo,
        password: Password,
        role: Role,
      }),
    });
    return clerkResponse.json();
  } catch (error) {
    console.error("Error creating a  clerk user:", error);
  }
};

export const updateClerkUser = async (
  token,
  clerkUserId,
  FirstName,
  LastName,
  Email,
  PhoneNo,
  Role
) => {
  try {
    const clerkResponse = await fetch(`${apiUrl}/users/clerk/update-user`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clerkId: clerkUserId,
        first_name: FirstName,
        last_name: LastName,
        email: Email,
        phone_no: PhoneNo,
        role: Role,
      }),
    });
    return clerkResponse.json();
  } catch (error) {
    console.error("Error updating a clerk user:", error);
  }
};