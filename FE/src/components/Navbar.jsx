import NotificationsIcon from '@mui/icons-material/Notifications';
import { Stack } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const Navbar = () => (
  <Stack
    direction="row"
    alignItems="center"
    p={2}
    sx={{
      position: "sticky",
      background: "linear-gradient(90deg, rgba(231,217,214,1) 0%, rgba(255,255,255,1) 100%)", // Gradient color
      top: 0,
      top: 0,
      justifyContent: "space-between",
      borderBottom: "5px solid rgba(0, 0, 0, 0.1)", // Change color and width as needed
      borderRadius: "0 0 20px 20px", // Curved bottom border
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" // Optional: adds a shadow effect
    }}
  >
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <img src={logo} alt="logo" height={10} width={40} />{" "}
    </Link>
    <NotificationsIcon
      sx={{
        cursor: "pointer",
        color: "black", // Change color as needed
        fontSize: 50,
        marginRight:10,  // Adjust size if necessary
      }}
    />
  </Stack>
);

export default Navbar;

