import React from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, InputBase, Paper,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Menu, Dialog, DialogTitle,
    DialogContent, DialogActions, ListItemIcon, OutlinedInput,
} from "@mui/material";
import { ArrowDropUp, ArrowDropDown, PictureAsPdfRounded, DescriptionRounded } from "@mui/icons-material";
import { Person, Logout, Menu as MenuIcon, Search as SearchIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import EditOutlined from '@mui/icons-material/EditOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import Sidebar from "../sidebar/Sidebar";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { downloadExport } from "../../helpers/downloadExport";

const HomePage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Urutkan");
    const [sortOrder, setSortOrder] = useState("asc");
    const [tableSortBy, setTableSortBy] = useState(null);
    const [tableSortOrder, setTableSortOrder] = useState("asc");
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

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

    const filteredAndSortedViolations = violations
        .filter((row) => {
            const matchSearch = Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const hideSelesai = sortBy === "status" ? row.status !== 3 : true;

            return matchSearch && hideSelesai;
        })
        .sort((a, b) => {
            if (sortBy === "Urutkan" || sortBy === "No") return 0;

            const valA = a[sortBy]?.toString().toLowerCase();
            const valB = b[sortBy]?.toString().toLowerCase();

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    const applyTableSorting = (data) => {
        if (!tableSortBy) return data;
        return [...data].sort((a, b) => {
            const valA = a[tableSortBy]?.toString().toLowerCase();
            const valB = b[tableSortBy]?.toString().toLowerCase();
            if (valA < valB) return tableSortOrder === "asc" ? -1 : 1;
            if (valA > valB) return tableSortOrder === "asc" ? 1 : -1;
            return 0;
        });
    };

    const finalSortedViolations = applyTableSorting(filteredAndSortedViolations);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const paginatedViolations = finalSortedViolations.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const totalPages = Math.ceil(finalSortedViolations.length / rowsPerPage);

    const tableHeaders = [
        { label: "No.", key: "id" },
        { label: "Nama", key: "nama" },
        { label: "NIM", key: "nim" },
        { label: "Prodi", key: "jurusan" },
        { label: "ID Kasus", key: "id_kasus" },
        { label: "Jenis Kasus", key: "jenis_kasus" },
        { label: "Status", key: "status" },
        { label: "Hasil Sidang", key: null },
        { label: "Notulensi", key: null },
    ];

    const violationsPerProdi = violations.reduce((acc, curr) => {
        const prodi = (curr.jurusan || "Tidak Diketahui").trim().toLowerCase();
        acc[prodi] = (acc[prodi] || 0) + 1;
        return acc;
    }, {});

    const formatJurusan = (nama) => {
        switch (nama.toLowerCase()) {
            case "rekayasa perangkat lunak":
                return "RPL";
            case "informatika":
                return "Informatika";
            case "data sains":
                return "Data Sains";
            default:
                return nama;
        }
    };

    const chartData = Object.entries(violationsPerProdi).map(([jurusan, jumlah]) => ({
        jurusan: formatJurusan(jurusan),
        jumlah
    }));

    const capitalizeWords = (str) =>
        str.replace(/\b\w/g, (char) => char.toUpperCase());

    const violationsPerJenis = violations.reduce((acc, curr) => {
        const jenis = (curr.jenis_kasus || "Tidak Diketahui").trim().toLowerCase();
        acc[jenis] = (acc[jenis] || 0) + 1;
        return acc;
    }, {});

    const jenisChartData = Object.entries(violationsPerJenis).map(([jenis, jumlah]) => ({
        jenis: capitalizeWords(jenis),
        jumlah,
    }));

    const handleRowClick = (row) => {
        setSelectedCase(row);
        setOpenDetailDialog(true);
    };

    return (
        <Box display="flex" flexDirection="column" sx={{ height: '100vh' }}>
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
            <Box sx={{ display: 'flex', flex: 1, minHeight: 0, height: 'calc(100vh - 64px)' }} bgcolor="#F8F9FA">
                {sidebarOpen && (
                    <Box sx={{ width: 270, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
                        <Sidebar user={{ name: userName, nip: user?.nip || "-", photo: userPhoto }} />
                    </Box>
                )}
                <Box flex={1} p={3} overflow="auto">
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        Selamat datang, {userName}!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {today}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 5 }}>
                        Data Pelanggaran Saat Ini
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
                        {/* Chart Jumlah Pelanggaran per Prodi */}
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                bgcolor: "#fff",
                                borderRadius: 3,
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                width: 400,
                                flex: "1 1 0",
                            }}
                        >
                            <Typography fontSize={16} fontWeight={600} textAlign="center" mb={2}>
                                Data pelanggaran berdasarkan prodi
                            </Typography>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 300,
                                    "& svg": {
                                        outline: "none",
                                    },
                                    "& svg:focus": {
                                        outline: "none",
                                    },
                                    "& path:focus, & rect:focus": {
                                        outline: "none",
                                    },
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="jurusan" angle={0} textAnchor="middle" interval={0} height={40} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="jumlah" fill="#F6404F" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                bgcolor: "#fff",
                                borderRadius: 3,
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                width: 400,
                                flex: "1 1 0",
                            }}
                        >
                            <Typography fontSize={16} fontWeight={600} textAlign="center" mb={2}>
                                Jenis kasus paling sering ditemukan
                            </Typography>
                            <Box
                                sx={{
                                    width: "100%",
                                    height: 300,
                                    "& svg": {
                                        outline: "none",
                                    },
                                    "& svg:focus": {
                                        outline: "none",
                                    },
                                    "& path:focus, & rect:focus": {
                                        outline: "none",
                                    },
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={jenisChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="jenis" angle={0} textAnchor="middle" interval={0} height={40} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="jumlah" fill="#F6404F" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Box>
                    <Box display="flex" alignItems="center" mt={3} gap={2}>
                        <Paper sx={{ display: "flex", alignItems: "center", p: "2px 8px", width: 240, borderRadius: 2 }} variant="outlined">
                            <SearchIcon sx={{ mr: 1, color: 'text.disabled' }} />
                            <InputBase
                                placeholder="Search..."
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Paper>
                        <Select
                            size="small"
                            value={sortBy}
                            renderValue={() => {
                                const labelMap = {
                                    Urutkan: "Urutkan",
                                    nama: "Nama",
                                    nim: "NIM",
                                    jurusan: "Prodi",
                                    id_kasus: "ID Kasus",
                                    jenis_kasus: "Jenis Kasus",
                                    status: "Status",
                                };
                                return labelMap[sortBy] || "Urutkan";
                            }}
                            input={<OutlinedInput />}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                '& .MuiOutlinedInput-notchedOutline': { borderRadius: 2 }
                            }}
                        >
                            {[
                                { label: "Urutkan", value: "Urutkan" },
                                { label: "Nama", value: "nama" },
                                { label: "NIM", value: "nim" },
                                { label: "Prodi", value: "jurusan" },
                                { label: "ID Kasus", value: "id_kasus" },
                                { label: "Jenis Kasus", value: "jenis_kasus" },
                                { label: "Status", value: "status" },
                            ].map(({ label, value }) => (
                                <MenuItem
                                    key={value}
                                    value={value}
                                    onClick={() => {
                                        if (sortBy === value) {
                                            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                                        } else {
                                            setSortBy(value);
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    {label}
                                </MenuItem>
                            ))}
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
                                    {tableHeaders.map(({ label, key }, i) => {
                                        const isActive = tableSortBy === key;

                                        return (
                                            <TableCell
                                                key={i}
                                                onClick={() => {
                                                    if (!key) return;
                                                    if (isActive) {
                                                        setTableSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                                                    } else {
                                                        setTableSortBy(key);
                                                        setTableSortOrder("asc");
                                                    }
                                                }}
                                                sx={{
                                                    fontWeight: "bold",
                                                    cursor: key ? "pointer" : "default",
                                                    userSelect: "none",
                                                    py: 1,
                                                }}
                                            >

                                                <Box display="flex" alignItems="center">
                                                    {label}
                                                    {key && (
                                                        <Box
                                                            display="flex"
                                                            flexDirection="column"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            ml={0.5}
                                                            sx={{ lineHeight: 1 }}
                                                        >
                                                            <ArrowDropUp
                                                                fontSize="medium"
                                                                sx={{
                                                                    color: isActive && tableSortOrder === "asc" ? "text.primary" : "#ccc",
                                                                    position: "relative",
                                                                    top: "6px",
                                                                }}
                                                            />
                                                            <ArrowDropDown
                                                                fontSize="medium"
                                                                sx={{
                                                                    color: isActive && tableSortOrder === "desc" ? "text.primary" : "#ccc",
                                                                    position: "relative",
                                                                    top: "-7px",
                                                                    mt: "-2px",
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedViolations.map((row, index) => (
                                    <TableRow key={row.id} onClick={(e) => {
                                        const isInExcludedColumn = e.target.closest('a, button'); if (isInExcludedColumn) return;
                                        handleRowClick(row);
                                    }} hover sx={{ cursor: 'pointer' }}>
                                        <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
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
                                                    pointerEvents: 'none',
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
                                                onClick={() =>
                                                    downloadExport({ id: row.id, type: 'hasil_sidang', nim: row.nim, token })
                                                }
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
                                                    textDecoration: "none",
                                                }}
                                                disabled={!row.hasil_sidang}
                                            >
                                                view
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() =>
                                                    downloadExport({ id: row.id, type: 'notulensi', nim: row.nim, token })
                                                }
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
                                                    textDecoration: "none",
                                                }}
                                                disabled={!row.notulensi}
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
                        mt={5}
                        mb={1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        <Box ml={1} fontSize={14} color="#555">
                            Halaman {currentPage} dari {totalPages}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    minWidth: 80,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderColor: "#ccc",
                                    color: "#000",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&.Mui-disabled': {
                                        borderColor: '#ccc',
                                        color: '#000',
                                    },
                                }}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => setCurrentPage(page)}
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
                                );
                            })}
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                sx={{
                                    borderRadius: 2,
                                    mx: 0.5,
                                    minWidth: 80,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderColor: "#ccc",
                                    color: "#000",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    '&.Mui-disabled': {
                                        borderColor: '#ccc',
                                        color: '#000',
                                    },
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
            <Dialog
                open={openDetailDialog}
                onClose={() => setOpenDetailDialog(false)}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 4, pt: 2.5, pb: 1, pl: 1, pr: 1 } }}
            >
                <DialogContent>
                    {selectedCase && (
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Box
                                bgcolor="#fff"
                                borderRadius={3}
                                boxShadow="0px 2px 8px rgba(0,0,0,0.1)"
                                p={3}
                                display="flex"
                                alignItems="center"
                            >
                                <Box position="relative">
                                    <Avatar
                                        src={`http://localhost:3001/uploads/temp/${selectedCase.foto || ''}`}
                                        sx={{ width: 100, height: 100 }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: '#000',
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CameraAltIcon sx={{ color: '#fff', fontSize: 16 }} />
                                    </Box>
                                </Box>
                                <Box ml={3} flexGrow={1}>
                                    <Typography variant="h6" fontWeight="600">Nama Mahasiswa</Typography>
                                    <Typography variant="body2" color="text.secondary" mb={1}>Data Mahasiswa</Typography>
                                    <Box display="flex" gap={4} width="100%" mt={1}>
                                        <Box width="50%">
                                            <Typography variant="caption" color="text.secondary">Nama</Typography>
                                            <Typography fontWeight={500}>{selectedCase.nama}</Typography>
                                        </Box>
                                        <Box width="50%">
                                            <Typography variant="caption" color="text.secondary">NIM</Typography>
                                            <Typography fontWeight={500}>{selectedCase.nim}</Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={4} width="100%" mt={1}>
                                        <Box width="50%">
                                            <Typography variant="caption" color="text.secondary">Prodi</Typography>
                                            <Typography fontWeight={500}>{selectedCase.jurusan}</Typography>
                                        </Box>
                                        <Box width="50%">
                                            <Typography variant="caption" color="text.secondary">Semester</Typography>
                                            <Typography fontWeight={500}>{selectedCase.semester ? `Semester ${selectedCase.semester}` : 'Semester 6'}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                bgcolor="#fff"
                                borderRadius={3}
                                boxShadow="0px 2px 8px rgba(0,0,0,0.1)"
                                p={3}
                            >
                                <Typography fontWeight={600} mb={2}>Tentang Kasus</Typography>
                                <Box
                                    display="grid"
                                    gridTemplateColumns="1fr 1fr"
                                    rowGap={2}
                                    columnGap={4}
                                    alignItems="center"
                                    mb={2}
                                >
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Nama Kasus</Typography>
                                        <Typography fontWeight={500}>{selectedCase.jenis_kasus}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">ID Kasus</Typography>
                                        <Typography fontWeight={500}>{selectedCase.id_kasus}</Typography>
                                    </Box>
                                </Box>
                                <Box mt={2}>
                                    <Typography variant="caption" color="text.secondary">Status Kasus</Typography><br />
                                    <Button
                                        size="small"
                                        sx={{
                                            bgcolor: selectedCase.status === 3
                                                ? "#28A745"
                                                : selectedCase.status === 4
                                                    ? "#F6404F"
                                                    : selectedCase.status === 2
                                                        ? "#FFC107"
                                                        : "#198754",
                                            color: '#fff',
                                            borderRadius: '999px',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            px: 3,
                                            mt: 0.5,
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        {selectedCase.status === 3
                                            ? "Selesai"
                                            : selectedCase.status === 4
                                                ? "Dibatalkan"
                                                : selectedCase.status === 2
                                                    ? "Tertunda"
                                                    : "Berjalan"}
                                    </Button>
                                </Box>
                            </Box>
                            <Box
                                bgcolor="#fff"
                                borderRadius={3}
                                boxShadow="0px 2px 8px rgba(0,0,0,0.1)"
                                p={3}
                            >
                                <Typography fontWeight={600} mb={2}>Documents</Typography>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    border="1px solid #E0E0E0"
                                    borderRadius={2}
                                    px={2}
                                    py={1.5}
                                    mb={1.5}
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <PictureAsPdfRounded sx={{ color: '#444' }} />
                                        <Typography>Hasil Sidang</Typography>
                                    </Box>
                                    <Button
                                        // href={`http://localhost:3001/uploads/data_pelanggaran/hasil_sidang/${selectedCase.hasil_sidang}`}
                                        // target="_blank"
                                        variant="contained"
                                        onClick={() =>
                                            downloadExport({
                                                id: selectedCase.id,
                                                type: 'hasil_sidang',
                                                nim: selectedCase.nim,
                                                token,
                                            })
                                        }
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#212121',
                                            '&:hover': { bgcolor: '#000' }
                                        }}
                                    >
                                        <DownloadIcon sx={{ mr: 1, fontSize: 18 }} />
                                        Download
                                    </Button>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    border="1px solid #E0E0E0"
                                    borderRadius={2}
                                    px={2}
                                    py={1.5}
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <DescriptionRounded sx={{ color: '#444' }} />
                                        <Typography>Notulensi</Typography>
                                    </Box>
                                    <Button
                                        onClick={() =>
                                            downloadExport({
                                                id: selectedCase.id,
                                                type: 'notulensi',
                                                nim: selectedCase.nim,
                                                token,
                                            })
                                        }
                                        variant="contained"
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#212121',
                                            '&:hover': { bgcolor: '#000' }
                                        }}
                                    >
                                        <DownloadIcon sx={{ mr: 1, fontSize: 18 }} />
                                        Download
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', px: 3, pb: 2 }}>
                    {(user?.role === 'admin' || user?.role === 'super admin') && (
                        <Button
                            startIcon={<EditOutlined />}
                            variant="contained"
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                bgcolor: '#212121',
                                '&:hover': { bgcolor: '#000' },
                                mr: 1
                            }}
                            onClick={() => {
                                setOpenDetailDialog(false);
                                navigate('/data-management', {
                                    state: { editData: selectedCase }
                                });
                            }}
                        >
                            Edit Case
                        </Button>
                    )}
                    <Button
                        onClick={() => setOpenDetailDialog(false)}
                        variant="contained"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            bgcolor: '#212121',
                            '&:hover': { bgcolor: '#000' }
                        }}
                    >
                        Back
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HomePage;
