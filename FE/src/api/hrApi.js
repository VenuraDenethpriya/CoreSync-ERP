const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

export const createTalentPool = async (token, memberData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/talent-pool`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(memberData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating talent pool:", error);
  }
};

export const fechTalentPoolList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/talent-pool?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching talent pool:", error);
  }
};

export const featchTalentPoolById = async (token, talentPoolId) => {
  try {
    const response = await fetch(`${apiUrl}/hr/talent-pool/${talentPoolId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching talent pool by id:", error);
  }
};

export const updateTalentPool = async (token, talentPool) => {
  try {
    const response = await fetch(`${apiUrl}/hr/talent-pool`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(talentPool),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating talent pool:", error);
  }
};

export const fechInterviewTrackerList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/interview-tracker?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching interview tracker:", error);
  }
};

export const featchInterviewTrackerById = async (token, interviewTrackerId) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/interview-tracker/${interviewTrackerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching interview tracker by id:", error);
  }
};

export const deleteInterviewTracker = async (token, interviewTrackerId) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/interview-tracker/${interviewTrackerId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.log("Error deleting data:", error);
  }
};

export const createEmployee = async (token, employeeData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(employeeData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating employee:", error);
  }
};

export const fetchEmployeeList = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/employee?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching employee list:", error);
  }
};

export const fetchEmployeeById = async (token, employeeId) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/${employeeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching employee by id:", error);
  }
};

export const deleteEmployee = async (token, employeeId) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/${employeeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.log("Error deleting data:", error);
  }
};

export const updateEmployee = async (token, employeeData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(employeeData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating employee:", error);
  }
};

export const featchMyInfo = async (token, email) => {
  try {
    const response = await fetch(`${apiUrl}/hr/myinfo/${email}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response?.json();
  } catch (error) {
    console.error("Error fetching my info:", error);
  }
};

const fallbackHolidays = [
  new Date(2026, 0, 3),
  new Date(2026, 0, 15),
  new Date(2026, 1, 1),
  new Date(2026, 1, 4),
  new Date(2026, 1, 15),
  new Date(2026, 2, 2),
  new Date(2026, 2, 21),
  new Date(2026, 3, 1),
  new Date(2026, 3, 3),
  new Date(2026, 3, 13),
  new Date(2026, 3, 14),
  new Date(2026, 4, 1),
  new Date(2026, 4, 2),
  new Date(2026, 4, 28),
  new Date(2026, 4, 30),
  new Date(2026, 5, 29),
  new Date(2026, 6, 29),
  new Date(2026, 7, 26),
  new Date(2026, 7, 27),
  new Date(2026, 8, 26),
  new Date(2026, 9, 25),
  new Date(2026, 10, 8),
  new Date(2026, 10, 24),
  new Date(2026, 11, 23),
  new Date(2026, 11, 25),
];

export const fetchPublicHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear();

    const [resThisYear, resNextYear] = await Promise.all([
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/LK`),
      fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${currentYear + 1}/LK`,
      ),
    ]);

    if (!resThisYear.ok || !resNextYear.ok) {
      throw new Error("API returned an error status");
    }

    const textThisYear = await resThisYear.text();
    const textNextYear = await resNextYear.text();

    if (!textThisYear || !textNextYear) {
      throw new Error("API returned empty data");
    }

    const dataThisYear = JSON.parse(textThisYear);
    const dataNextYear = JSON.parse(textNextYear);

    if (dataThisYear.length === 0) {
      throw new Error("API has no holiday data for Sri Lanka yet");
    }

    return [...dataThisYear, ...dataNextYear].map((h) => {
      const [year, month, day] = h.date.split("-");
      return new Date(year, month - 1, day);
    });
  } catch (error) {
    console.warn("Using fallback holiday data. Reason:", error.message);
    return fallbackHolidays;
  }
};

export const createLeaveRequest = async (token, leaveData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/request-leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(leaveData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating leave request:", error);
  }
};

export const fetchLeaveRequests = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/employee/request-leave?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching leave requests:", error);
  }
};

export const updateLeaveRequst = async (token, leaveData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/request-leave`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(leaveData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating leave request:", error);
  }
};

export const fechPayrollEmployeeList = async (
  token,
  query,
  limit,
  offset,
  salaryCycle,
) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/employee/payroll?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}&salary_cycle=${salaryCycle}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching payroll employee list:", error);
  }
};

export const createPayroll = async (token, payrollData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/payroll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payrollData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error creating payroll:", error);
  }
};

export const fechPayrollHistoryList = async (
  token,
  query,
  limit,
  offset,
  salaryCycle,
  employeeId,
  month,
) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (query) params.append("query", query);
    if (salaryCycle) params.append("salary_cycle", salaryCycle);
    if (employeeId) params.append("employee_id", employeeId);
    if (month) params.append("month", month);

    const response = await fetch(
      `${apiUrl}/hr/employee/payroll/history?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching payroll history:", error);
  }
};

export const updatePayroll = async (token, payrollData) => {
  try {
    const response = await fetch(`${apiUrl}/hr/employee/payroll`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payrollData),
    });
    return response?.json();
  } catch (error) {
    console.error("Error updating leave request:", error);
  }
};

export const fetchBirthdays = async (token, query, limit, offset) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/employee/birthday?query=${encodeURIComponent(
        query,
      )}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.error("Error fetching employees's birthdays:", error);
  }
};

export const deletePayrollHistory = async (token, payrollHistoryId) => {
  try {
    const response = await fetch(
      `${apiUrl}/hr/employee/payroll/${payrollHistoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    return response?.json();
  } catch (error) {
    console.log("Error deleting data:", error);
  }
};
