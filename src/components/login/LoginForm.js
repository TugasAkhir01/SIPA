import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ForgotPasswordDialog from "./ForgotPassword";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal");
        return;
      }

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
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        component="img"
        src="/assets/bg-illustration.jpg"
        alt="Background"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "100%", md: "60%" },
          height: { xs: "100%", md: "80%" },
          objectFit: "contain",
          zIndex: 0,
        }}
      />

      <Paper
        elevation={4}
        sx={{
          zIndex: 1,
          px: 5,
          py: 6,
          textAlign: "center",
          width: 400,
        }}
      >
        <Box>
          <Box
            component="img"
            src="/assets/telkom-logo.png"
            alt="Telkom University"
            sx={{ height: 100 }}
          />
        </Box>

        <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
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
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: "left", mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                Remember Me
              </Typography>
            }
          />
        </Box>
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            height: 48,
            fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
            fontSize: 16,
            backgroundColor: "#87ACFF",
            color: "#000",
            '&:hover': {
              backgroundColor: "#6f98f5",
            },
          }}
          onClick={handleLogin}
        >
          LOGIN
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 2,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "'Poppins', sans-serif",
            textDecoration: "underline",
          }}
          onClick={() => setOpenForgot(true)}
        >
          Lupa Password ?
        </Typography>
        {openForgot && <ForgotPasswordDialog onClose={() => setOpenForgot(false)} />}
      </Paper>
    </Box>
  );
};

export default LoginForm;
