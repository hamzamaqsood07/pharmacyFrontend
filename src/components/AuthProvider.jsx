import { useState,useEffect } from "react";
import api from "../utils/axiosConfig";
import {AuthContext} from "../contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define the fetch function so it can be called on login/refresh
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }     
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      setOrganization(response.data.organization);
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token");
      setUser(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []); // Empty dependency array = Runs ONLY ONCE on app load

  return (
    <AuthContext.Provider value={{ user, organization,setOrganization ,loading, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};