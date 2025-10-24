import React, { useState, useEffect, useContext } from "react";
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
import { useLogo } from "../contexts/LogoContext";
import { ThemeContext } from "../contexts/ThemeContext";



const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { themeColors } = useContext(ThemeContext);
  const { logoUrl, setLogoUrl } = useLogo();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await api.get("/auth/me");
        setUser(response.data.user);
        setOrganization(response.data.organization);
        setLogoUrl(response.data.organization.logoUrl);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  // Update CSS custom properties when theme colors change
  useEffect(() => {
    if (themeColors) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', themeColors.primaryColor);
      root.style.setProperty('--secondary-color', themeColors.secondaryColor);
      
      // Create lighter versions for hover states
      const lightenColor = (color, amount) => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
          (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
          (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
      };
      
      root.style.setProperty('--primary-color-light', lightenColor(themeColors.primaryColor, 0.3));
      root.style.setProperty('--secondary-color-light', lightenColor(themeColors.secondaryColor, 0.3));
    }
  }, [themeColors]);

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
          width: 220,
          height: "100vh",
          backgroundColor: themeColors?.primaryColor ? `${themeColors.primaryColor}08` : "#f8f9fa",
          borderRight: `2px solid ${themeColors?.primaryColor || "#1976d2"}`,
          position: "fixed",
          top: 0,
          left: 0,
          p: 2,
          boxShadow: `0 0 20px ${themeColors?.primaryColor || "#1976d2"}30`,
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent:"center",
            gap: 1.5,
            mb: 2,
          }}
        >
          {logoUrl? (
            <Box
              component="img"
              src={logoUrl}
              alt="Organization Logo"
              sx={{
                width: 80,
                height: 70,
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

          
        </Box>

        <Divider sx={{ mb: 2 }} />

        <ul className="sidebarList">
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
          width: `calc(100% - 220px)`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {organization?.orgTitle || "Pharmacy Management"}
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
          ml: "222px",
          mt: 8,
          p: 3,
          backgroundColor: themeColors?.primaryColor ? `${themeColors.primaryColor}05` : "#f5f5f5",
          minHeight: "100vh",
          backgroundImage: `linear-gradient(135deg, ${themeColors?.primaryColor || "#1976d2"}05 0%, ${themeColors?.secondaryColor || "#dc004e"}05 100%)`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
