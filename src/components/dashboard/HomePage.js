import React from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, InputBase, Paper,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Menu, Dialog, DialogTitle,
    DialogContent, DialogActions, ListItemIcon, OutlinedInput,
} from "@mui/material";
import { PictureAsPdfRounded, DescriptionRounded } from "@mui/icons-material";
import { Person, Logout, Menu as MenuIcon, Search as SearchIcon } from "@mui/icons-material";
import Sidebar from "../sidebar/Sidebar";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const HomePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleSignOut = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
    };

    const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user"));
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    const userName = user?.nama || "User";
    const [violations, setViolations] = React.useState([]);

    const [today, setToday] = useState("");
    useEffect(() => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        setToday(formatter.format(now));
    }, []);

    React.useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3001/api/violations", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Gagal ambil data");

            const data = await res.json();
            setViolations(data);
        } catch (err) {
            console.error("❌ Gagal fetch:", err);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchData();
    }, [fetchData, token]);

    const userPhoto = user?.photo
        ? `http://localhost:3001/uploads/profile/${user.photo}`
        : "/default-avatar.png";

    return (
        <Box>
            <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: "#F6404F" }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "#fff" }}>
                            <MenuIcon />
                        </IconButton>
                        <Box component="img" src="/assets/telkom-logo-white.png" alt="Logo" sx={{ height: 50, ml: 1 }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#fff", ml: 2 }}>
                            SiPPAK
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            onClick={handleClick}
                            sx={{
                                display: "flex", alignItems: "center", cursor: "pointer", px: 1, py: 0.5,
                                borderRadius: 1, "&:hover": { backgroundColor: theme.palette.action.hover },
                            }}
                        >
                            <Avatar alt={userName} src={userPhoto} onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }} sx={{ width: 36, height: 36, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" fontSize={16} sx={{ color: "#fff" }}>
                                {userName}
                            </Typography>
                        </Box>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem onClick={() => navigate("/profile")}>
                                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={() => setLogoutDialogOpen(true)}>
                                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                                Sign out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box display="flex" height="93vh" bgcolor="#F8F9FA">
                {sidebarOpen && <Sidebar user={{ name: userName, nip: user?.nip || "-", photo: userPhoto }} />}
                <Box flex={1} p={3}>
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        Selamat datang, {userName}!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {today}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 5 }}>
                        Data Pelanggaran Saat Ini
                    </Typography>
                    <Box display="flex" alignItems="center" mt={2} gap={2}>
                        <Paper sx={{ display: "flex", alignItems: "center", p: "2px 8px", width: 240, borderRadius: 2 }} variant="outlined">
                            <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} />
                            <InputBase placeholder="Search..." fullWidth />
                        </Paper>
                        <Select
                            size="small"
                            defaultValue="Urutkan"
                            input={<OutlinedInput />}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <MenuItem value="Urutkan">Urutkan</MenuItem>
                            <MenuItem value="No">No.</MenuItem>
                            <MenuItem value="Nama">Nama</MenuItem>
                            <MenuItem value="NIM">NIM</MenuItem>
                            <MenuItem value="jurusan">Jurusan</MenuItem>
                            <MenuItem value="IdKasus">ID Kasus</MenuItem>
                            <MenuItem value="JenisKasus">Jenis Kasus</MenuItem>
                            <MenuItem value="Status">Status</MenuItem>
                        </Select>

                    </Box>
                    <TableContainer
                        component={Paper}
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            boxShadow: 2,
                            overflowX: "auto",
                        }}
                    >
                        <Table size="medium">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                                    {[
                                        "No.",
                                        "Nama",
                                        "NIM",
                                        "Jurusan",
                                        "ID Kasus",
                                        "Jenis Kasus",
                                        "Status",
                                        "Hasil Sidang",
                                        "Notulensi"
                                    ].map((head, i) => (
                                        <TableCell key={i} sx={{ fontWeight: "bold" }}>
                                            {head}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {violations.map((row, index) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.nama}</TableCell>
                                        <TableCell>{row.nim}</TableCell>
                                        <TableCell>{row.jurusan}</TableCell>
                                        <TableCell>{row.id_kasus}</TableCell>
                                        <TableCell>{row.jenis_kasus}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                sx={{
                                                    bgcolor:
                                                        row.status === 3
                                                            ? "#28A745"
                                                            : row.status === 4
                                                                ? "#F6404F"
                                                                : row.status === 2
                                                                    ? "#FFC107"
                                                                    : "#DEE2E6",
                                                    color:
                                                        row.status === 1 || row.status === 2 ? "#000" : "#fff",
                                                    borderRadius: "50px",
                                                    px: 2,
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                }}
                                            >
                                                {row.status === 3
                                                    ? "Selesai"
                                                    : row.status === 4
                                                        ? "Dibatalkan"
                                                        : row.status === 2
                                                            ? "Tertunda"
                                                            : "Berjalan"}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                startIcon={<PictureAsPdfRounded />}
                                                sx={{
                                                    bgcolor: "#F1F1F1",
                                                    color: "#2C2C2C",
                                                    textTransform: "none",
                                                    borderRadius: "12px",
                                                    fontWeight: 500,
                                                    boxShadow: "none",
                                                    px: 2,
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                startIcon={<DescriptionRounded />}
                                                sx={{
                                                    bgcolor: "#F1F1F1",
                                                    color: "#2C2C2C",
                                                    textTransform: "none",
                                                    borderRadius: "12px",
                                                    fontWeight: 500,
                                                    boxShadow: "none",
                                                    px: 2,
                                                }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box
                        mt={20}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Box ml={1} fontSize={14} color="#555">
                            Halaman 1 Dari 50 Halaman
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    minWidth: 80,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderColor: "#ccc",
                                    color: "#000",
                                }}
                            >
                                Previous
                            </Button>
                            {[1, 2, 3].map((page) => (
                                <Button
                                    key={page}
                                    variant={page === 1 ? "contained" : "outlined"}
                                    size="small"
                                    sx={{
                                        borderRadius: 2,
                                        mx: 0.5,
                                        minWidth: 40,
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        bgcolor: page === 1 ? "#000" : "#fff",
                                        color: page === 1 ? "#fff" : "#000",
                                        borderColor: "#ccc",
                                        boxShadow: "none",
                                        "&:hover": {
                                            bgcolor: page === 1 ? "#000" : "#f0f0f0",
                                        },
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    minWidth: 80,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderColor: "#ccc",
                                    color: "#000",
                                }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                sx={{ '& .MuiDialog-paper': { borderRadius: '16px', width: 330, minHeight: 300 } }}
            >
                <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}>
                    <Box sx={{ mb: 1, mt: 2 }}>
                        <Logout sx={{ color: "error.main", fontSize: "60px" }} />
                    </Box>
                    <Typography variant="h6" component="span" fontWeight="bold">
                        Konfirmasi Logout
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body2">
                        Apakah Anda yakin ingin keluar dari akun ini?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ mr: 2, mb: 2, gap: 1 }}>
                    <Button onClick={() => setLogoutDialogOpen(false)} color="primary" variant="outlined">
                        Batal
                    </Button>
                    <Button onClick={handleSignOut} color="error" variant="contained">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HomePage;
