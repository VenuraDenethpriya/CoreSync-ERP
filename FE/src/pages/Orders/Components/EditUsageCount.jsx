// import { featchAllOrders } from "@/api/orderApi";
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useAuth } from "@clerk/clerk-react";
// import { Pencil } from "lucide-react";
// import { useEffect, useState } from "react";

// function EditUsageCount(props) {
//   const { getToken } = useAuth();

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   const newValue = e.target.new_value.value;
//   //   props.handleEditCount(props.item, newValue);
//   // };
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // FIXED: If it's an order, use the state variable. Otherwise, read the input field.
//     let newValue;
//     if (isOrder) {
//       newValue = orderID;
//     } else {
//       newValue = e.target.new_value.value;
//     }

//     props.handleEditCount(props.item, newValue);
//   };

//   const isAllocation = props.type === "allocation";
//   const isOrder = props.type === "order";

//   const vat = "";
//   const orderStatus = "";
//   const paymentStatus = "";
//   const [data, setData] = useState([])
//   const [orderID, setOrderID] = useState();
//   const [searchOrders, setSearchOrders] = useState("")
//   const [limitOrders, setLimitOrders] = useState(10)
//   const [offsetOrders, setOffsetOrders] = useState(0)
//   const [ordersLoading, setOrdersLoading] = useState(false);
//   const [ordersError, setOrdersError] = useState(null);
//   const [totalOrders, setTotalOrders] = useState(0)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setOrdersLoading(true);
//         setOrdersError(null);
//         const token = await getToken();

//         let searchValue = searchOrders;
//         if (searchValue.startsWith("INV/EHP/")) {
//           searchValue = searchValue.replace("INV/EHP/", "");
//         }

//         const response = await featchAllOrders(token, searchValue, vat, orderStatus, paymentStatus, limitOrders, offsetOrders);
//         const apiData = response?.data.orders || [];
//         const total = response.data.total_orders;
//         setTotalOrders(total)

//         const mappedData = apiData
//           .map((order) => ({
//             orderId: order.id,
//             orderNo: order.order_no,
//             type: order.type,
//             created_at: order.created_at,
//             updated_at: order.updated_at,

//           }))
//           .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//         setData(mappedData);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         setOrdersError("Failed to load orders. Please try again.");
//       } finally {
//         setOrdersLoading(false);
//       }
//     };
//     fetchData();
//   }, [searchOrders, limitOrders, offsetOrders, getToken]);

//   return (
//     <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
//       <DialogContent className="sm:max-w-[450px]">
//         <DialogHeader>
//           <DialogTitle>
//             {isAllocation ? "Edit Allocation Count" : isOrder ? "Edit Order No" : "Edit Usage Count"}
//           </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit}>
//           <div className="grid gap-4">
//             <div className="grid gap-3">
//               <Label htmlFor="new_value">{isAllocation ? "Count" : isOrder ? "Order No" : "Usage Count"}</Label>

//               {
//                 isOrder ? (
//                   <Select onValueChange={setOrderID} defaultValue={orderID}>
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select an order..." />
//                     </SelectTrigger>

//                     <SelectContent>
//                       <Input
//                         type="text"
//                         placeholder="Search Order No"
//                         className="mb-2"
//                         value={searchOrders}
//                         onChange={(e) => setSearchOrders(e.target.value)}
//                       />
//                       {ordersLoading ? (
//                         <SelectItem value="loading" disabled>Searching orders...</SelectItem>
//                       ) : ordersError ? (
//                         <div className="p-2 text-red-600 text-center">
//                           <p>{ordersError}</p>
//                         </div>
//                       ) : data.length > 0 ? (
//                         data.map((order) => (
//                           <SelectItem key={order.orderId} value={order.orderId}>
//                             {order.type}{order.orderNo}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem value="no-results" disabled>No orders found.</SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 ) : (
//                   <Input
//                     type="number"
//                     name="new_value"
//                     id="new_value"
//                     placeholder={isAllocation ? "Enter new allocation count" : "Enter new usage count"}
//                     defaultValue={isAllocation ? props.item.count : props.item.usage_count}
//                   />)
//               }

//             </div>
//           </div>
//           <DialogFooter className="pt-4">
//             <DialogClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DialogClose>
//             <Button type="submit">Save changes</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


// export default EditUsageCount;

import { featchAllOrders } from "@/api/orderApi";
import { fetchCasingsList, fetchWireHarnessList } from "@/api/productionApi";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

function EditUsageCount(props) {
  const { getToken } = useAuth();

  const isAllocation = props.type === "allocation";
  const isOrder = props.type === "order";
  const isCasing = props.type === "casing";
  const isWire = props.type === "wire";

  const vat = "";
  const orderStatus = "";
  const paymentStatus = "";

  // Orders State
  const [data, setData] = useState([]);
  const [orderID, setOrderID] = useState("");
  const [searchOrders, setSearchOrders] = useState("");
  const [limitOrders, setLimitOrders] = useState(10);
  const [offsetOrders, setOffsetOrders] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);

  // Casings State
  const [casingsData, setCasingsData] = useState([]);
  const [casingID, setCasingID] = useState("");
  const [searchCasings, setSearchCasings] = useState("");
  const [casingsLoading, setCasingsLoading] = useState(false);
  const [casingsError, setCasingsError] = useState(null);

  // Wire Harness State
  const [wireData, setWireData] = useState([]);
  const [wireHarnessID, setWireHarnessID] = useState("");
  const [searchWire, setSearchWire] = useState("");
  const [wireLoading, setWireLoading] = useState(false);
  const [wireError, setWireError] = useState(null);

  // Fetch Orders
  useEffect(() => {
    if (!isOrder || !props.isOpen) return;
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const token = await getToken();

        let searchValue = searchOrders;
        if (searchValue.startsWith("INV/EHP/")) {
          searchValue = searchValue.replace("INV/EHP/", "");
        }

        const response = await featchAllOrders(token, searchValue, vat, orderStatus, paymentStatus, limitOrders, offsetOrders);
        const apiData = response?.data.orders || [];
        setTotalOrders(response?.data?.total_orders || 0);

        const mappedData = apiData
          .map((order) => ({
            orderId: order.id,
            orderNo: order.order_no,
            type: order.type,
            created_at: order.created_at,
          }))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to load orders. Please try again.");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [searchOrders, limitOrders, offsetOrders, getToken, isOrder, props.isOpen]);

  // Fetch Casings
  useEffect(() => {
    if (!isCasing || !props.isOpen) return;
    const fetchCasings = async () => {
      try {
        setCasingsLoading(true);
        setCasingsError(null);
        const token = await getToken();

        const response = await fetchCasingsList(token, searchCasings, 10, 0);
        setCasingsData(response?.data?.casings || []);
      } catch (error) {
        console.error("Error fetching casings:", error);
        setCasingsError("Failed to load casings. Please try again.");
      } finally {
        setCasingsLoading(false);
      }
    };
    fetchCasings();
  }, [searchCasings, getToken, isCasing, props.isOpen]);

  // Fetch Wire Harness
  useEffect(() => {
    if (!isWire || !props.isOpen) return;
    const fetchWires = async () => {
      try {
        setWireLoading(true);
        setWireError(null);
        const token = await getToken();

        const response = await fetchWireHarnessList(token, searchWire, 10, 0);
        setWireData(response?.data?.wire_harness || []);
      } catch (error) {
        console.error("Error fetching wire harness:", error);
        setWireError("Failed to load wire harnesses. Please try again.");
      } finally {
        setWireLoading(false);
      }
    };
    fetchWires();
  }, [searchWire, getToken, isWire, props.isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let newValue;
    if (isOrder) {
      newValue = orderID;
    } else if (isCasing) {
      newValue = casingID;
    } else if (isWire) {
      newValue = wireHarnessID;
    } else {
      newValue = e.target.new_value.value;
    }

    props.handleEditCount(props.item, newValue);
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isAllocation
              ? "Edit Allocation Count"
              : isOrder
              ? "Edit Order No"
              : isCasing
              ? "Edit Casing No"
              : isWire
              ? "Edit Wire Harness No"
              : "Edit Usage Count"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="new_value">
                {isAllocation
                  ? "Count"
                  : isOrder
                  ? "Order No"
                  : isCasing
                  ? "Casing Serial No"
                  : isWire
                  ? "Wire Harness Serial No"
                  : "Usage Count"}
              </Label>

              {isOrder ? (
                <Select onValueChange={setOrderID} defaultValue={orderID}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an order..." />
                  </SelectTrigger>
                  <SelectContent>
                    <Input
                      type="text"
                      placeholder="Search Order No"
                      className="mb-2"
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {ordersLoading ? (
                      <SelectItem value="loading" disabled>Searching orders...</SelectItem>
                    ) : ordersError ? (
                      <div className="p-2 text-red-600 text-center"><p>{ordersError}</p></div>
                    ) : data.length > 0 ? (
                      data.map((order) => (
                        <SelectItem key={order.orderId} value={order.orderId}>
                          {order.type}{order.orderNo}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-results" disabled>No orders found.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : isCasing ? (
                <Select onValueChange={setCasingID} defaultValue={casingID}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a casing..." />
                  </SelectTrigger>
                  <SelectContent>
                    <Input
                      type="text"
                      placeholder="Search Casing Serial No"
                      className="mb-2"
                      value={searchCasings}
                      onChange={(e) => setSearchCasings(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {casingsLoading ? (
                      <SelectItem value="loading-casings" disabled>Searching casings...</SelectItem>
                    ) : casingsError ? (
                      <div className="p-2 text-red-600 text-center"><p>{casingsError}</p></div>
                    ) : casingsData.length > 0 ? (
                      casingsData.map((casing) => (
                        <SelectItem key={casing.id} value={casing.id}>
                          {casing.serial_no} {casing.product_name ? `(${casing.product_name})` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-casing-results" disabled>No casings found.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : isWire ? (
                <Select onValueChange={setWireHarnessID} defaultValue={wireHarnessID}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a wire harness..." />
                  </SelectTrigger>
                  <SelectContent>
                    <Input
                      type="text"
                      placeholder="Search Wire Harness Serial No"
                      className="mb-2"
                      value={searchWire}
                      onChange={(e) => setSearchWire(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {wireLoading ? (
                      <SelectItem value="loading-wire" disabled>Searching wire harnesses...</SelectItem>
                    ) : wireError ? (
                      <div className="p-2 text-red-600 text-center"><p>{wireError}</p></div>
                    ) : wireData.length > 0 ? (
                      wireData.map((wire) => (
                        <SelectItem key={wire.id} value={wire.id}>
                          {wire.serial_no} {wire.product_name ? `(${wire.product_name})` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-wire-results" disabled>No wire harnesses found.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  name="new_value"
                  id="new_value"
                  placeholder={isAllocation ? "Enter new allocation count" : "Enter new usage count"}
                  defaultValue={isAllocation ? props.item.count : props.item.usage_count}
                />
              )}
            </div>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditUsageCount;