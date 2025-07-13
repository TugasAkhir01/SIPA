import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ForgotPasswordDialog = ({ onClose }) => {
  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <Box
      onClick={handleOverlayClick}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          width: 280,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Box
          component="img"
          src="/assets/whatsapp.png"
          alt="WhatsApp Logo"
          sx={{
            width: 100,
            height: 100,
            mb: 4,
          }}
        />
        <a
          href="https://wa.me/6282285265242"
          // href="https://wa.me/6282216669978"
          //+62 822-8526-5242
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="outlined"
            fullWidth
            sx={{
              backgroundColor: "white",
              color: "black",
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 3,
              borderColor: "#ddd",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              py: 1.2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoOutlinedIcon sx={{ fontSize: 20 }} />
              <Typography variant="body1" fontWeight={500}>
                Kontak Admin
              </Typography>
            </Box>
          </Button>
        </a>
        <Typography
          variant="body2"
          sx={{ mt: 3, cursor: "pointer", textDecoration: "underline" }}
          onClick={onClose}
        >
          Tutup
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordDialog;
