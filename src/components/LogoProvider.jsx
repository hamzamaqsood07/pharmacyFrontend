import { useState } from "react";
import { LogoContext } from "../contexts/LogoContext";

export const LogoProvider = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(null);

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  );
};