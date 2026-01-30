import React, { useState } from "react";
import "./Login.css";
import { TextField } from "@mui/material";
import { InputLabel } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { FormControl } from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, data);
      
      
      // Try to get token from response body first, then from headers
      const token = response.data.token || response.headers.authorization?.replace('Bearer ', '');
      
      
      if (token) {
        localStorage.setItem('token', token);
        window.location.href = "/";
      } else {
        setError("Login failed - no token received");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <div className="loginParentDiv">
        <div className="loginContainer">
          <div className="loginHeading">
            <h3>Log in into your account</h3>
          </div>

          <form className="loginForm" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="loginError">{error}</div>}

            <TextField
              {...register("email", {
                required: { value: true, message: "Email is required" },
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
              sx={{ marginBottom: "18px" }}
              label="Enter Email"
              margin="normal"
              size="meduim"
              fullWidth
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">
                Enter Password
              </InputLabel>
              <OutlinedInput
                {...register("password", {
                  required: { value: true, message: "Password is required" },
                })}
                sx={{ marginBottom: "17px" }}
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                size="meduim"
                margin="dense"
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Enter Password"
              />
            </FormControl>
            {errors.password && (
              <div className="passwordError">{errors.password.message}</div>
            )}

            <input
              className="loginButton"
              disabled={isSubmitting}
              type="submit"
              value="Login"
            />
          </form>
        </div>
      </div>
    </>
  );
}
