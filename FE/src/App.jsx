import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
//import { AuthProvider } from "./services/context/AuthContext";
import ProtectedRoute from "./services/routes/ProtectedRoute";

import Layout from "./components/Layout";
import DashBoard from "./pages/DashBoard";
import Inventory from "./pages/Inventory/Inventory";
import Notifications from "./pages/Notifications";
import Orders from "./pages/Orders/Orders";
import Settings from "./pages/Settings";
import Products from "./pages/Products/Products";
import AddBatteryPack from "./pages/Products/AddBatteryPack";
import AddSolar from "./pages/Products/AddSolar";
import ProductDetails from "./pages/Products/ProductDetails";
import LogInPage from "./pages/LogInPage";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-react";
import Quotes from "./pages/Quotes/Quotes";
import AddSolarQuote from "./pages/Quotes/AddSolarQuote";
import AddBatteryPackQuote from "./pages/Quotes/AddBatteryPackQuote";
import QuoteDetails from "./pages/Quotes/QuoteDetails";
import AddInventoryItem from "./pages/Inventory/AddItem";
import AddOrder from "./pages/Orders/Components/AddOrder";
import OrderDetails from "./pages/Orders/OrderDetails";
import Customers from "./pages/Customers/Customer";
import AddCustomer from "./pages/Customers/AddCustomer";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Users from "./pages/Users/User";
import AddUser from "./pages/Users/AddUser";
import AddOther from "./pages/Products/AddOther";
import InventoryDetails from "./pages/Inventory/InventoryDetails";
import AddEV from "./pages/Products/AddEV";
import Approvals from "./pages/Approvals/Approvals";
import ApprovalsView from "./pages/Approvals/Components/ApprovalsView";
import AddService from "./pages/Products/AddService";
import OrderCards from "./pages/Orders/OrderCards";
import AddTask from "./pages/Approvals/Components/AddTask";
import TaskCards from "./pages/Approvals/TaskCards";
import Sales from "./pages/Sales/Sales";
import AddSale from "./pages/Sales/Sales/AddSale";
import SaleDetails from "./pages/Sales/Sales/SalesDetails";
import AddSaleperson from "./pages/Sales/Team/AddSaleperson";
import SalespersonDetails from "./pages/Sales/Team/SalespersonDetails";
import LoadingScreen from "./components/LoadingScreen";
import Repairs from "./pages/Repairs/Repairs";
import AddRepair from "./pages/Repairs/Components/AddRepair";
import RepairDetails from "./pages/Repairs/RepairDetails";
import Reports from "./pages/Reports/Reports";
import TalentPool from "./pages/Hr/TalentPool/TalentPool";
import Employee from "./pages/Hr/Employees/Employee";
import Leaves from "./pages/Hr/Leave/Leave";
import AddMember from "./pages/Hr/TalentPool/AddMember";
import MemberDetails from "./pages/Hr/TalentPool/MemberDetails";
import InterviewTracker from "./pages/Hr/InterviewTracker/InterviewTracker";
import AddInterview from "./pages/Hr/InterviewTracker/AddInterview";
import InterviewDetails from "./pages/Hr/InterviewTracker/InterviewDetails";

function App() {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
  }

  return (
    //<AuthProvider>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>

      <ClerkLoaded>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashBoard />} />
              <Route path="/" element={<DashBoard />}  />


              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/add-item" element={<AddInventoryItem />}  />
              <Route path="inventory/:itemId" element={<InventoryDetails />} />


              <Route path="products" element={<Products />} />
              <Route path="products/add-battery-pack" element={<AddBatteryPack />}  />
              <Route path="products/add-solar" element={<AddSolar />}  />
              <Route path="products/add-ev" element={<AddEV />}  />
              <Route path="products/add-service" element={<AddService />} />
              <Route path="products/add-other" element={<AddOther />}  />
              <Route path="products/:productId" element={<ProductDetails />}  />

              <Route path="quotes" element={<Quotes />}  />
              <Route path="quotes/add-battery-pack-quote" element={<AddBatteryPackQuote />} />
              <Route path="quotes/add-solar-quote"element={<AddSolarQuote />}  />
              <Route path="quotes/:quoteId" element={<QuoteDetails />} />

              <Route path="orders" element={<Orders />}  />
              <Route path="orders/add-order" element={<AddOrder />}  />
              <Route path="orders/:orderId" element={<OrderDetails />} />

              <Route path="approvals" element={<Approvals />} />
              <Route path="approvals/:orderId"  element={<ApprovalsView />} />

              <Route path="users/add-task" element={<AddTask />}  />

              <Route path="customers"  element={<Customers />}  />
              <Route path="customers/add-customer" element={<AddCustomer />}  />
              <Route path="customers/:customerId" element={<CustomerDetails />} />

              <Route path="users"element={<Users />} />
              <Route path="users/add-user" element={<AddUser />} />
              <Route path="customers/:customerId"element={<CustomerDetails />} />

              <Route path="sales"element={<Sales />} />

              <Route path="sales/add-sale" element={<AddSale />} />
              <Route path="sales/add-salesperson" element={<AddSaleperson />} />

              <Route path="sales/:saleId" element={<ProtectedRoute element={<SaleDetails />} />} />
              <Route path="sales/salespersons/:salespersonId" element={<ProtectedRoute element={<SalespersonDetails />} />} />

              <Route path="repairs" element={<Repairs />} />
              <Route path="repairs/add-repair" element={<AddRepair />}  />
              <Route path="repairs/:repairId" element={<RepairDetails />} />

              <Route path="reports" element={<Reports />} />


              <Route path="hr/talent-pool" element={<ProtectedRoute element={<TalentPool />} />} />
              <Route path="hr/talent-pool/add-member" element={<ProtectedRoute element={<AddMember />} />} />
              <Route path="hr/talent-pool/:memberId" element={<ProtectedRoute element={<MemberDetails />} />} />

              <Route path="hr/interviews-tracker" element={<ProtectedRoute element={<InterviewTracker />} />} />
              <Route path="hr/interviews-tracker/add-interview" element={<ProtectedRoute element={<AddInterview />} />} />
              <Route path="hr/interviews-tracker/:interviewId" element={<ProtectedRoute element={<InterviewDetails />} />} />

              <Route path="hr/employees" element={<ProtectedRoute element={<Employee />} />} />
              <Route path="hr/leave" element={<ProtectedRoute element={<Leaves />} />} />
            </Route>
            <Route path="orders/order-cards" element={<OrderCards />} />
            <Route path="approvals/task-cards" element={<TaskCards />} />
            <Route path="/login" element={<LogInPage />} />
          </Routes>
        </Router>
      </ClerkLoaded>
    </ClerkProvider>

    //</AuthProvider>
  );
}

export default App;
