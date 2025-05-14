import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ForgotPasswordDialog from "./ForgotPassword";
import { useEffect } from "react";

const LoginForm = () => {
  const navigate = useNavigate();

  const [openForgot, setOpenForgot] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rememberedId = localStorage.getItem("rememberedIdentifier");
    const rememberedPwd = localStorage.getItem("rememberedPassword");
    const rememberedUser = localStorage.getItem("user");

    if (rememberedId && rememberedUser) {
      setIdentifier(rememberedId);
      setPassword(rememberedPwd || "");
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      console.log("Token diterima:", data.token);
      
      if (rememberMe) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("rememberedIdentifier", identifier);
        localStorage.setItem("rememberedPassword", password);
      } else {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("rememberedIdentifier");
        localStorage.removeItem("rememberedPassword");
      }

      navigate("/home");
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 8,
          textAlign: "center",
          backgroundColor: "background.paper",
          width: 400,
          borderRadius: 2,
        }}
      >
        <Box mb={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              backgroundColor: "grey.100",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          />
        </Box>
        <Typography variant="h6" color="text.primary" gutterBottom>
          LOGIN
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email / NIP"
          variant="outlined"
          fullWidth
          margin="dense"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="dense"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ width: "100%", textAlign: "left", mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember Me"
          />
        </Box>


        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, height: 48, fontWeight: "bold" }}
          onClick={handleLogin}
        >
          LOGIN
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, cursor: "pointer" }}
          onClick={() => setOpenForgot(true)}
        >
          Lupa Password ?
        </Typography>

        {openForgot && (
          <ForgotPasswordDialog onClose={() => setOpenForgot(false)} />
        )}
      </Paper>
    </Box>
  );
};

export default LoginForm;
