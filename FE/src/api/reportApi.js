const apiUrl = import.meta.env.VITE_API_BASE_GO_URL;

// export const fetchReportData = async (token, type, startDate, endDate, vat, orderStatus, PaymentMode, paymentStatus, selectedSalesperson) => {
//   try {
//     const response = await fetch(
//       `${apiUrl}/reports/${type}?start_date=${encodeURIComponent(startDate)}&end_date=${endDate}&vat=${vat}&$order_status=${orderStatus}&payment_status=${paymentStatus}&payment_mode=${PaymentMode}&salesperson=${selectedSalesperson}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       },
//     );
//     return response.json();
//   } catch (error) {
//     console.error("Error fetching reports data:", error);
//   }
// };

export const fetchReportData = async (
  token, type, startDate, endDate, vat, orderStatus, PaymentMode, paymentStatus, selectedSalesperson
) => {
  try {
    const params = new URLSearchParams();

    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (vat) params.append("vat", vat);
    if (orderStatus) params.append("order_status", orderStatus); 
    if (paymentStatus) params.append("payment_status", paymentStatus);
    if (PaymentMode) params.append("payment_mode", PaymentMode);
    if (selectedSalesperson) params.append("salesperson", selectedSalesperson);

    const response = await fetch(`${apiUrl}/reports/${type}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching reports data:", error);
  }
};