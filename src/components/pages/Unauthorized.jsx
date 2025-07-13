// pages/Unauthorized.jsx
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#fef6f6",
        px: 2,
      }}
    >
      <ReportProblemRoundedIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
      <Typography variant="h4" color="error.main" fontWeight={700} gutterBottom>
        Akses Ditolak
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi admin jika kamu merasa ini adalah kesalahan.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ textTransform: "none", fontWeight: 600 }}
        onClick={() => navigate("/dashboard")}
      >
        Kembali ke Dashboard
      </Button>
    </Box>
  );
};

export default Unauthorized;
