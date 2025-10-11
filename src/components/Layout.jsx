import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { Logout, Person } from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import "./Layout.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicationIcon from "@mui/icons-material/Medication";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BusinessIcon from "@mui/icons-material/Business";

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await api.get("/auth/me");
        console.log(response.data.organization)
        setUser(response.data.user);
        setOrganization(response.data.organization);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          height: "100vh",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #ddd",
          position: "fixed",
          top: 0,
          left: 0,
          p: 2,
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          {organization?.logoUrl ? (
            <Box
              component="img"
              src={organization.logoUrl}
              alt="Organization Logo"
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "8px",
                backgroundColor: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {organization?.orgTitle?.charAt(0) || "P"}
            </Box>
          )}

          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {organization?.orgTitle || "Pharmacy"}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <NavLink to="/" className="sidebarLink">
              <DashboardIcon sx={{ mr: 1, fontSize: 20 }} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/medicines" className="sidebarLink">
              <MedicationIcon sx={{ mr: 1, fontSize: 20 }} /> Medicines
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase" className="sidebarLink">
              <ShoppingCartIcon sx={{ mr: 1, fontSize: 20 }} /> Purchase
            </NavLink>
          </li>
          <li>
            <NavLink to="/invoices" className="sidebarLink">
              <ReceiptIcon sx={{ mr: 1, fontSize: 20 }} /> Invoices
            </NavLink>
          </li>
          <li>
            <NavLink to="/organization" className="sidebarLink">
              <BusinessIcon sx={{ mr: 1, fontSize: 20 }} /> Organization
            </NavLink>
          </li>
        </ul>
      </Box>

      {/* Topbar */}
      <AppBar
        position="fixed"
        sx={{
          ml: "240px",
          width: `calc(100% - 240px)`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Pharmacy Management System
          </Typography>
          <IconButton onClick={handleProfileMenuOpen} color="inherit">
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0) || "U"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleProfileMenuClose();
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: "240px",
          mt: 8,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
