// src/contexts/AuthContext.js
import React, { createContext, useContext } from "react";


export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);