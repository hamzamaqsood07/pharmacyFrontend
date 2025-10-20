import { useState, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import api from "../utils/axiosConfig";
import { ThemeContext } from "../contexts/ThemeContext";
import { Box, CircularProgress, Typography } from "@mui/material";

export const ThemeProvider = ({ children }) => {
  const [themeColors, setThemeColors] = useState({
    primaryColor: "#1976d2",
    secondaryColor: "#dc004e",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchThemeColors();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchThemeColors = async () => {
    try {
      const response = await api.get("/organization");
      console.log(response.data);
      if (response.data) {
        const colors = {
          primaryColor: response.data.primaryColor || "#1976d2",
          secondaryColor: response.data.secondaryColor || "#dc004e",
        };
        setThemeColors(colors);
        localStorage.setItem("themeColors", JSON.stringify(colors));
        console.log("object");
      }
    } catch (error) {
      console.error("Error fetching theme colors:", error);
      const savedColors = localStorage.getItem("themeColors");
      if (savedColors) {
        setThemeColors(JSON.parse(savedColors));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateThemeColors = async (newColors) => {
    try {
      await api.patch("/organization", newColors);
      setThemeColors(newColors);
      localStorage.setItem("themeColors", JSON.stringify(newColors));
      return true;
    } catch (error) {
      console.error("Error updating theme colors:", error);
      return false;
    }
  };

  const createCustomTheme = (colors) => {
    return createTheme({
      palette: {
        primary: {
          main: colors.primaryColor,
          light: lightenColor(colors.primaryColor, 0.3),
          dark: darkenColor(colors.primaryColor, 0.3),
          contrastText: "#ffffff",
        },
        secondary: {
          main: colors.secondaryColor,
          light: lightenColor(colors.secondaryColor, 0.3),
          dark: darkenColor(colors.secondaryColor, 0.3),
          contrastText: "#ffffff",
        },
      },
    });
  };

  const lightenColor = (color, amount) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const darkenColor = (color, amount) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  };

  const theme = createCustomTheme(themeColors);

  const value = {
    themeColors,
    updateThemeColors,
    loading,
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <CircularProgress
          size={70}
          thickness={5}
          sx={{ color: "#fff", mb: 3 }}
        />
        <Typography variant="h5" fontWeight="bold" letterSpacing={1}>
          Loading your theme...
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
          Please wait while we prepare your dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
