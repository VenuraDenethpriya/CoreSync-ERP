import { featchCardOrders } from "@/api/orderApi";
import wsService from "@/api/ws";
import AddUsage from "@/components/AddUsage";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderCards() {
    const { getToken } = useAuth();
    const search = "";
    const limit = 15;
    const offset = 0;
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getOrder = async () => {
            setIsLoading(true);
            try {
                const token = await getToken();
                const res = await featchCardOrders(token, search, limit, offset);
                setOrders(res?.data || []);
                setIsError(false);
                setErrorMessage("");
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsError(true);
                setErrorMessage(error.message || "Failed to fetch orders.");
            } finally {
                setIsLoading(false);
            }
        };

        getOrder();
    }, [getToken, limit, search, offset]);



    // useEffect(() => {
    //     wsService.connect(import.meta.env.VITE_WS_URL);

    //     const handleUpdate = (data) => {
    //         console.log("WS event received:", data);

    //         if (data.type === "order.created") {
    //             setOrders(prev => [data.order, ...prev]);

    //         } else if (data.type === "order.updated") {
    //             setOrders(prev =>
    //                 prev.map(o => (o.id === data.order.id ? data.order : o))
    //             );

    //         } else if (data.type === "order.deleted") {
    //             setOrders(prev =>
    //                 prev.filter(o => o.id !== data.order.id)
    //             );
    //         }
    //     };

    //     wsService.subscribe(handleUpdate);

    //     return () => {
    //         wsService.unsubscribe(handleUpdate);
    //     };
    // }, []);

    useEffect(() => {
        // REMOVED: wsService.connect() is no longer needed here.
        // The service connects automatically when you subscribe to a topic.

        const handleUpdate = (data) => {
            console.log("WS event received for orders:", data);

            // Your existing logic for updating state is perfect.
            // Note: The new service sends data as { type: "...", data: {...} }
            // So you'll access the order via 'data.data' instead of 'data.order'
            const orderData = data.data;

            if (data.type === "order.created") {
                setOrders(prev => [orderData, ...prev]);
            } else if (data.type === "order.updated") {
                setOrders(prev =>
                    prev.map(o => (o.id === orderData.id ? orderData : o))
                );
            } else if (data.type === "order.deleted") {
                setOrders(prev =>
                    prev.filter(o => o.id !== orderData.id)
                );
            }
        };

        // CHANGED: Specify the 'orders' topic when subscribing.
        wsService.subscribe('orders', handleUpdate);

        return () => {
            // CHANGED: Specify the 'orders' topic when unsubscribing.
            wsService.unsubscribe('orders', handleUpdate);
        };
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return <Badge className="rounded-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm">Pending</Badge>;
            case "Balancing":
                return <Badge className="rounded-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm">Balancing</Badge>;
            case "Delivered":
                return <Badge className="rounded-full bg-green-600 hover:bg-green-800 text-white px-3 py-1 text-sm">Delivered</Badge>;
            case "Completed":
                return <Badge className="rounded-full bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 text-sm">Completed</Badge>;
            case "Drafted":
                return <Badge className="rounded-full bg-amber-500 hover:bg-amber-700 text-white px-3 py-1 text-sm">Drafted</Badge>;
            default:
                return null;
        }
    };

    // const onRetry = () => {
    //     window.location.reload();
    // };

    if (isError) {
        return (
            <section className="p-8 lg:p-12 bg-gradient-to-br from-red-50 to-red-100 min-h-screen flex flex-col items-center justify-center text-center">
                {/* Icon */}
                <div className="bg-red-100 p-6 rounded-full shadow-md mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-red-700 mb-3">
                    Oops! Something went wrong
                </h2>

                {/* Message */}
                <p className="text-gray-600 max-w-md mb-6">
                    {errorMessage || "We couldn’t load the orders. Please check your connection or try again."}
                </p>

                {/* Retry Button */}
                {/* <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition"
                >
                    Retry
                </button> */}
            </section>
        )
    }

    if (isLoading) {
        return (
            <section className="p-8 lg:p-12 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex flex-col gap-6">
                {/* Heading Skeleton */}
                <div className="mb-2">
                    <Skeleton className="h-8 w-40 rounded-lg bg-blue-200/40" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white bg-gradient-to-br from-white to-blue-50 shadow-md rounded-3xl p-6 flex flex-col justify-between"
                            style={{ height: "400px" }}
                        >
                            <div className="flex flex-col gap-4">
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-6 w-24 rounded-md bg-blue-200/40" />
                                    <Skeleton className="h-6 w-16 rounded-md bg-blue-200/40" />
                                </div>

                                {/* Delivery Date */}
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full bg-yellow-200/40" />
                                    <Skeleton className="h-5 w-40 rounded-md bg-yellow-200/40" />
                                </div>

                                {/* Order Items */}
                                <div className="flex flex-col gap-2 mt-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-8 w-full rounded-xl bg-blue-200/30"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full bg-blue-200/40" />
                                    <Skeleton className="h-5 w-32 rounded-md bg-blue-200/40" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full bg-green-200/40" />
                                    <div className="flex gap-1 flex-wrap">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <Skeleton
                                                key={i}
                                                className="h-5 w-16 rounded-full bg-green-200/40"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="px-8 lg:px-12 bg-gradient-to-br py-4 from-blue-50 to-blue-100 min-h-screen flex flex-col gap-6">
            <div className="mb-2">
                <h2 className="text-2xl lg:text-4xl font-semibold leading-tight mb-2 lg:mb-0 pl-4">Orders</h2>
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {orders.slice(0, 8).map((o) => (
                    <div
                        key={o.id}
                        className="bg-white bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-2xl rounded-3xl p-6 flex flex-col justify-between transform transition-all duration-300 hover:scale-105"
                        style={{
                            height: "400px",
                            border: "1px solid #1e3a8a",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {/* Header */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-x-2">
                                    <span
                                        className="text-lg font-bold text-gray-700 cursor-pointer hover:text-blue-700 hover:underline transition"
                                        onClick={() => navigate(`/orders/${o.id}`)}
                                    >
                                        {o.type} {o.order_no}
                                    </span>
                                    <AddUsage
                                        type="order"
                                        orderData={o}
                                    // orderId={o.id}
                                    />
                                </div>
                                <div>
                                    {getStatusBadge(o.OrderStatus)}
                                </div>


                            </div>

                            {/* Delivery Date */}
                            <div className="flex items-center gap-2 mb-3 bg-yellow-50 px-3 py-2 rounded-lg w-fit shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-yellow-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-sm font-semibold text-yellow-700">Expected Delivery:</span>
                                <span className="text-gray-800 font-medium">
                                    {new Date(o.expected_delivery_date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>


                            {/* Order Items */}
                            <div className="mb-2">
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-900"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7h18M3 12h18M3 17h18"
                                        />
                                    </svg>
                                    <span className="text-sm font-semibold text-gray-800">Order Items</span>
                                </div>

                                {/* Items List */}
                                <ul className="overflow-y-auto max-h-40 space-y-2 px-1">
                                    {o.order_items?.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 py-2 shadow-sm hover:shadow-md hover:scale-105 transform transition duration-200 cursor-pointer"
                                        >
                                            <span className="truncate font-medium text-gray-900">{item.product_name || "Unnamed Product"}</span>
                                            <span className="bg-blue-200 text-blue-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                x{item.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                        </div>

                        {/* Footer: Supervisor & Assignees */}
                        <div className="mt-4 flex flex-col gap-2 bg-gray-50 p-3 rounded-xl shadow-inner">
                            {o.supervisor && (
                                <div className="flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.8.635 6.879 1.804M12 12a5 5 0 100-10 5 5 0 000 10z"
                                        />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Supervisor:</span>
                                    <span className="text-gray-800 truncate">{o.supervisor}</span>
                                </div>
                            )}

                            {o.assignee && o.assignee.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a5 5 0 100-10 5 5 0 000 10z"
                                        />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Assignees:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {o.assignee.map((a, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium"
                                            >
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>


        </section>
    );
}

export default OrderCards;