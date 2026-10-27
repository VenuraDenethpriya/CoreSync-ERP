import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
//import { AuthProvider } from "./services/context/AuthContext";
import ProtectedRoute from "./services/routes/ProtectedRoute";

import Layout from "./components/Layout";
import DashBoard from "./pages/DashBoard";
import Inventory from "./pages/Inventory/Inventory";
import Orders from "./pages/Orders/Orders";
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
import AddInventoryItem from "./pages/Inventory/Inventory/AddItem";
import AddOrder from "./pages/Orders/Components/AddOrder";
import OrderDetails from "./pages/Orders/OrderDetails";
import Customers from "./pages/Customers/Customer";
import AddCustomer from "./pages/Customers/AddCustomer";
import CustomerDetails from "./pages/Customers/CustomerDetails";
import Users from "./pages/Users/User";
import AddUser from "./pages/Users/AddUser";
import AddOther from "./pages/Products/AddOther";
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
import Leaves from "./pages/Hr/Leave/Leave";
import MemberDetails from "./pages/Hr/TalentPool/MemberDetails";
import InterviewTracker from "./pages/Hr/InterviewTracker/InterviewTracker";
import InterviewDetails from "./pages/Hr/InterviewTracker/InterviewDetails";
import AddEmployee from "./pages/Hr/Employees/AddEmployee";
import EmployeeDetails from "./pages/Hr/Employees/EmployeeDetails";
import Employee from "./pages/Hr/Employees/Employee";
import PackView from "./pages/Orders/Components/PackView";
import PackApprovalsView from "./pages/Approvals/Components/PackApprovalsView";
import AddPack from "./pages/Orders/Components/AddPack";
import AddSite from "./pages/Approvals/Components/AddSite";
import SitsView from "./pages/Approvals/Components/SiteView";
import SiteCards from "./pages/Approvals/SiteCards";
import Finance from "./pages/Finance/Finance";
import AddPurchasesOrder from "./pages/Finance/AddPurchasesOrder";
import PurchaseOrderView from "./pages/Finance/Components/PurchaseOrderView";
import InventoryDetails from "./pages/Inventory/Inventory/InventoryDetails";
import AddItemOrder from "./pages/Inventory/Orders/AddItemOrder";
import StockControl from "./pages/StockControl/StockControl"; // [ADDED 2026-10-13]
import AddTalentMember from "./pages/Hr/TalentPool/AddMember";
import Letter from "./pages/Hr/Letters/Letter";
import MyInfo from "./pages/MyInfo/MyInfo";
import AddLeave from "./pages/Hr/Leave/AddLeave";
import Payroll from "./pages/Hr/Payroll/Payroll";
import AddCasing from "./pages/Productions/Components/AddCasing";
import AddWire from "./pages/Productions/Components/AddWire";
import Production from "./pages/Productions/Production";

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
              <Route element={<DashBoard />} />
              <Route path="/"element={<DashBoard />} />


              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/add-item" element={<AddInventoryItem />} />
              <Route path="inventory/:itemId" element={<InventoryDetails />} />

              <Route path="inventory/add-item-order" element={<AddItemOrder />} />
              {/* [ADDED 2026-10-13] inventory controls */}
              <Route path="stock-control" element={<StockControl />} />


              <Route path="products"element={<Products />}  />
              <Route path="products/add-battery-pack" element={<AddBatteryPack />}/>
              <Route path="products/add-solar" element={<AddSolar />} />
              <Route path="products/add-ev" element={<AddEV />} />
              <Route path="products/add-service" element={<AddService />} />
              <Route path="products/add-other" element={<AddOther />} />
              <Route path="products/:productId" element={<ProductDetails />} />

              <Route path="quotes"element={<Quotes />}  />
              <Route path="quotes/add-battery-pack-quote" element={<AddBatteryPackQuote />}  />
              <Route path="quotes/add-solar-quote" element={<AddSolarQuote />} />
              <Route path="quotes/:quoteId" element={<QuoteDetails />} />

              <Route path="orders" element={<Orders />} />
              <Route path="orders/add-order" element={<AddOrder />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="orders/packs/:packId" element={<PackView />} />
              <Route path="orders/packs/add-pack" element={<AddPack />} />

              <Route path="approvals" element={<Approvals />} />
              <Route path="approvals/:orderId" element={<ApprovalsView />} />
              <Route path="approvals/packs/:packId" element={<PackApprovalsView />} />

              <Route path="productions" element={<Production />} />
              <Route path="productions/add-casing" element={<AddCasing />} />
              <Route path="productions/add-wire-harness" element={<AddWire />} />

              <Route path="approvals/site/add-site" element={<AddSite />} />
              <Route path="approvals/sites/:siteId" element={<SitsView />} />
              <Route path="users/add-task" element={<AddTask />} />

              <Route path="customers" element={<Customers />} />
              <Route path="customers/add-customer" element={<AddCustomer />} />
              <Route path="customers/:customerId" element={<CustomerDetails />} />

              <Route path="users" element={<ProtectedRoute element={<Users />} />} />
              <Route path="users/add-user" element={<ProtectedRoute element={<AddUser />} />} />
              <Route path="customers/:customerId" element={<ProtectedRoute element={<CustomerDetails />} />} />

              <Route path="sales"  element={<Sales />}  />

              <Route path="sales/add-sale"  element={<AddSale />}  />
              <Route path="sales/add-salesperson"  element={<AddSaleperson />} />

              <Route path="sales/:saleId" element={<SaleDetails />}  />
              <Route path="sales/salespersons/:salespersonId" element={<SalespersonDetails />}  />

              <Route path="repairs" element={<Repairs />} />
              <Route path="repairs/add-repair"  element={<AddRepair />}  />
              <Route path="repairs/:repairId"  element={<RepairDetails />}  />

              <Route path="reports" element={<ProtectedRoute element={<Reports />} />} />

              <Route path="finance" element={<ProtectedRoute element={<Finance />} />} />
              <Route path="finance/purchases/add-purchase" element={<ProtectedRoute element={<AddPurchasesOrder />} />} />
              <Route path="finance/purchases/:purchaseId" element={<ProtectedRoute element={<PurchaseOrderView />} />} />

              <Route path="hr/talent-pool" element={<ProtectedRoute element={<TalentPool />} />} />
              <Route path="hr/talent-pool/add-talent-member" element={<ProtectedRoute element={<AddTalentMember />} />} />
              <Route path="hr/talent-pool/:talentPoolId" element={<ProtectedRoute element={<MemberDetails />} />} />

              <Route path="hr/interviews-tracker" element={<ProtectedRoute element={<InterviewTracker />} />} />
              <Route path="hr/interviews-tracker/:interviewTrackerId" element={<ProtectedRoute element={<InterviewDetails />} />} />

              <Route path="hr/employees" element={<ProtectedRoute element={<Employee />} />} />
              <Route path="hr/employees/add-employee" element={<ProtectedRoute element={<AddEmployee />} />} />
              <Route path="hr/employees/:employeId" element={<ProtectedRoute element={<EmployeeDetails />} />} />

              <Route path="hr/leave" element={<ProtectedRoute element={<Leaves />} />} />
              <Route path="hr/leave/add-leave-request" element={<ProtectedRoute element={<AddLeave />} />} />

              <Route path="hr/letters" element={<ProtectedRoute element={<Letter />} />} />

              <Route path="hr/payroll" element={<ProtectedRoute element={<Payroll />} />} />


              <Route path="myinfo" element={<ProtectedRoute element={<MyInfo />} />} />
            </Route>
            <Route path="orders/order-cards" element={<OrderCards />} />
            <Route path="approvals/task-cards" element={<TaskCards />} />
            <Route path="approvals/site-cards" element={<SiteCards />} />
            <Route path="/login" element={<LogInPage />} />
          </Routes>
        </Router>
      </ClerkLoaded>
    </ClerkProvider>

    //</AuthProvider>
  );
}

export default App;
