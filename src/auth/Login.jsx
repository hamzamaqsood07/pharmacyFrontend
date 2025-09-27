import React, { useState } from 'react'
import "./Login.css"
import { TextField } from '@mui/material'
import { InputLabel } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { FormControl } from '@mui/material';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';



export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = useState("")
  const navigate = useNavigate();


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
  } = useForm()

  const onSubmit = async (data) => {
    setError("")
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data }),
      credentials: "include"
    })
    const info = await response.json();
    if (!info.message) {
      setError("")
    }
    else {
      setError(info.message)
    }
    if (response.status == 200) {
      navigate("/")
    }
  };

  return (
    <>
      <div className='loginParentDiv'>

        <div className='loginContainer'>

          <div className='loginHeading'>
            <h3>Log in into your account</h3>
          </div>


          <form className='loginForm' onSubmit={handleSubmit(onSubmit)} >
            {
              error && (
                <div className='loginError'>
                  {error}
                </div>
              )
            }

            <TextField
              {...register("email", {
                required: { value: true, message: "Email is required" }, pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address"
                }
              })}

              sx={{ marginBottom: "18px" }}
              label="Enter Email"
              margin='normal'
              size='meduim'
              fullWidth
              type='email'
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">Enter Password</InputLabel>
              <OutlinedInput
                {...register("password", { required: { value: true, message: "Password is required" }, minLength: { value: 8, message: "Password must have atleast 8 characters" }, maxLength: { value: 64, message: "Password must not be above 64 characters" } })}

                sx={{ marginBottom: "17px" }}
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                size='meduim'
                margin='dense'
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
            {errors.password && <div className='passwordError'>{errors.password.message}</div>}

            <input className='loginButton' disabled={isSubmitting} type="submit" value="Login" />

          </form>


          <p>Don't have an account?<NavLink className='signupLink' to="/signup">Sign up</NavLink></p>

        </div>
      </div>
    </>
  )
}
