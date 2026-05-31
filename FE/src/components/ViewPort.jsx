// import React, { useState } from "react";
// import { useLocation, useNavigate, Routes, Route, Navigate } from "react-router-dom";
// import { 
//   Box, 
//   Typography, 
//   BottomNavigation, 
//   BottomNavigationAction, 
//   Paper, 
//   Stack, 
//   Menu, 
//   MenuItem, 
//   ListItemIcon, 
//   ListItemText 
// } from "@mui/material";
// import { useTheme } from '@mui/material/styles';
// import useMediaQuery from '@mui/material/useMediaQuery';
// import { UserButton } from "@clerk/clerk-react";

// // Icons
// import DashboardIcon from '@mui/icons-material/DashboardOutlined';
// import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
// import CategoryIcon from '@mui/icons-material/CategoryOutlined';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
// import RequestQuoteIcon from '@mui/icons-material/RequestQuoteOutlined';
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import { SparklesIcon, UserIcon, UsersIcon } from "lucide-react";

// // Components & Pages
// import Sidebar, { SidebarItem } from "./Sidebar";
// import DashBoard from "../pages/DashBoard";
// import Inventory from "../pages/Inventory/Inventory";
// import Products from "../pages/Products/Products";
// import Orders from "../pages/Orders/Orders";
// import Approvals from "@/pages/Approvals/Approvals";
// import Customers from "../pages/Customers";
// import Users from "../pages/Users";
// import Quotes from "@/pages/Quotes/Quotes";
// import Sales from "@/pages/Sales/Sales";

// const ViewPort = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   const [expanded, setExpanded] = useState(true);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const openMore = Boolean(anchorEl);

//   // Helper to determine which tab is active (handles sub-routes)
//   const getActiveValue = () => {
//     const path = location.pathname;
//     if (path === "/" || path.startsWith("/dashboard")) return "/dashboard";
//     if (path.startsWith("/inventory")) return "/inventory";
//     if (path.startsWith("/products")) return "/products";
//     if (path.startsWith("/quotes")) return "/quotes";
//     if (path.startsWith("/orders")) return "/orders";
//     return path;
//   };

//   const handleMoreClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMoreClose = (path) => {
//     setAnchorEl(null);
//     if (path) navigate(path);
//   };

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
//       <Stack sx={{ flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
        
//         {/* Desktop Sidebar */}
//         {!isMobile && (
//           <Box sx={{ borderRight: "1px solid #e5e7eb" }}>
//             <Sidebar expanded={expanded} setExpanded={setExpanded}>
//               <SidebarItem icon={<DashboardIcon />} text="Dashboard" to="/dashboard" />
//               <SidebarItem icon={<InventoryIcon />} text="Inventory" to="/inventory" />
//               <SidebarItem icon={<CategoryIcon />} text="Products" to="/products" />
//               <SidebarItem icon={<RequestQuoteIcon />} text="Quotes" to="/quotes" />
//               <SidebarItem icon={<ShoppingCartIcon />} text="Orders" to="/orders" />
//               <SidebarItem icon={<RequestQuoteIcon />} text="Approvals" to="/approvals" />
//               <SidebarItem icon={<SparklesIcon size={20} />} text="Sales" to="/sales" />
//               <SidebarItem icon={<UsersIcon size={20} />} text="Customers" to="/customers" />
//               <SidebarItem icon={<UserIcon size={20} />} text="Users" to="/users" />
//             </Sidebar>
//           </Box>
//         )}

//         {/* Main Content Area */}
//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             overflowY: "auto",
//             backgroundColor: "#fcf5f3",
//             // Padding Bottom is critical so content isn't hidden by the BottomNav
//             pb: isMobile ? "80px" : 0, 
//             transition: "all 0.3s"
//           }}
//         >
//           {/* Mobile Header */}
//           {isMobile && (
//             <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eee' }}>
//               <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>Renewaa</Typography>
//               <UserButton afterSignOutUrl="/" />
//             </Box>
//           )}

//           <Box p={isMobile ? 2 : 4}>
//             <Routes>
//               <Route path="/" element={<Navigate to="/dashboard" replace />} />
//               <Route path="/dashboard" element={<DashBoard />} />
//               <Route path="/inventory" element={<Inventory />} />
//               <Route path="/products" element={<Products />} />
//               <Route path="/quotes" element={<Quotes />} />
//               <Route path="/orders" element={<Orders />} />
//               <Route path="/approvals" element={<Approvals />} />
//               <Route path="/sales" element={<Sales />} />
//               <Route path="/customers" element={<Customers />} />
//               <Route path="/users" element={<Users />} />
//             </Routes>
//           </Box>

//           {!isMobile && (
//             <Typography variant="body2" sx={{ p: 2, color: "#947e79", textAlign: 'center' }}>
//               Copyright © Renewaa
//             </Typography>
//           )}
//         </Box>
//       </Stack>

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <Paper
//           sx={{
//             position: 'fixed',
//             bottom: 0,
//             left: 0,
//             right: 0,
//             zIndex: 1000,
//             borderTop: '1px solid #e5e7eb'
//           }}
//           elevation={3}
//         >
//           <BottomNavigation
//             showLabels
//             value={getActiveValue()}
//             onChange={(event, newValue) => {
//               if (newValue !== "more") {
//                 navigate(newValue);
//               }
//             }}
//             sx={{
//               height: 70,
//               '& .Mui-selected': { color: '#6366f1' }
//             }}
//           >
//             <BottomNavigationAction label="Home" value="/dashboard" icon={<DashboardIcon />} />
//             <BottomNavigationAction label="Stock" value="/inventory" icon={<InventoryIcon />} />
//             <BottomNavigationAction label="Items" value="/products" icon={<CategoryIcon />} />
//             <BottomNavigationAction label="Quotes" value="/quotes" icon={<RequestQuoteIcon />} />
//             <BottomNavigationAction 
//               label="More" 
//               value="more" 
//               onClick={handleMoreClick}
//               icon={<MoreHorizIcon />} 
//             />
//           </BottomNavigation>

//           {/* Mobile "More" Menu for items that don't fit */}
//           <Menu
//             anchorEl={anchorEl}
//             open={openMore}
//             onClose={() => handleMoreClose()}
//             anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//             transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//             sx={{ mb: 2 }}
//           >
//             <MenuItem onClick={() => handleMoreClose("/orders")}>
//               <ListItemIcon><ShoppingCartIcon fontSize="small" /></ListItemIcon>
//               <ListItemText>Orders</ListItemText>
//             </MenuItem>
//             <MenuItem onClick={() => handleMoreClose("/approvals")}>
//               <ListItemIcon><RequestQuoteIcon fontSize="small" /></ListItemIcon>
//               <ListItemText>Approvals</ListItemText>
//             </MenuItem>
//             <MenuItem onClick={() => handleMoreClose("/sales")}>
//               <ListItemIcon><SparklesIcon size={18} /></ListItemIcon>
//               <ListItemText>Sales</ListItemText>
//             </MenuItem>
//             <MenuItem onClick={() => handleMoreClose("/customers")}>
//               <ListItemIcon><UsersIcon size={18} /></ListItemIcon>
//               <ListItemText>Customers</ListItemText>
//             </MenuItem>
//           </Menu>
//         </Paper>
//       )}
//     </Box>
//   );
// };

// export default ViewPort;