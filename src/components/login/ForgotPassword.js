import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

const ForgotPasswordDialog = ({ onClose }) => {
  return (
    <Box
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
        sx={{
          padding: 3,
          textAlign: "center",
          backgroundColor: "background.paper",
          width: 280,
          height: 300,
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
              mt: 3,
              mb: 2
            }}
          />
        </Box>
        <a
          href="https://wa.me/6282216669978"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              textTransform: "none",
              fontWeight: "bold",
              mt: 5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <ContactSupportIcon sx={{ marginLeft: -3.5 }} />
              <Box sx={{ order: 2 }}>KONTAK ADMIN</Box>
            </Box>
          </Button>
        </a>
        <Typography
          variant="body2"
          sx={{ mt: 2, cursor: "pointer" }}
          onClick={onClose}
        >
          Tutup
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordDialog;