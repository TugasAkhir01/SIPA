import React, { useEffect, useCallback, useState } from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, InputBase, Paper,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Menu, Dialog, DialogTitle,
    DialogContent, DialogActions, ListItemIcon, OutlinedInput,
} from "@mui/material";
import { ArrowDropUp, ArrowDropDown, PictureAsPdfRounded, DescriptionRounded } from "@mui/icons-material";
import { Person, Logout, Menu as MenuIcon, Search as SearchIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import EditOutlined from '@mui/icons-material/EditOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from "../sidebar/Sidebar";
import FileUpload from "./fileupload.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { downloadExport } from "../../helpers/downloadExport";

const DataManagement = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Urutkan");
    const [sortOrder, setSortOrder] = useState("asc");
    const [tableSortBy, setTableSortBy] = useState(null);
    const [tableSortOrder, setTableSortOrder] = useState("asc");
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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

    React.useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    const [openUploadHasil, setOpenUploadHasil] = React.useState(false);
    const [openUploadNotulensi, setOpenUploadNotulensi] = React.useState(false);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const location = useLocation();
    const editData = location.state?.editData;
    const [errors, setErrors] = useState({});

    const [violations, setViolations] = React.useState([]);
    const [form, setForm] = React.useState({
        nama: '',
        nim: '',
        jurusan: '',
        semester: '',
        id_kasus: '',
        jenis_kasus: '',
        status: '',
        hasil_sidang: '',
        notulensi: '',
        foto: '',
        deskripsi: ''
    });
    const [editMode, setEditMode] = React.useState(false);
    const [editId, setEditId] = React.useState(null);

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

    const getFileNameFromPath = (path) => {
        if (!path) return "";
        return path.split('/').pop();
    };

    const handleOpenAddDialog = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const todayStr = `${dd}${mm}${yy}`;

        const casesToday = violations.filter(v =>
            v.id_kasus && v.id_kasus.startsWith(todayStr)
        );
        const nextIndex = String(casesToday.length + 1).padStart(2, '0');
        const generatedIdKasus = `${todayStr}${nextIndex}`;

        setForm({
            nama: '',
            nim: '',
            jurusan: '',
            semester: '',
            id_kasus: generatedIdKasus,
            jenis_kasus: '',
            status: '',
            hasil_sidang: '',
            notulensi: '',
            foto: '',
            deskripsi: '',
            status_approval: 'Pending',
        });

        setEditMode(false);
        setEditId(null);
        setOpenAddDialog(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.nama.trim()) newErrors.nama = "* Nama tidak boleh kosong";
        if (!form.nim.trim()) newErrors.nim = "* NIM tidak boleh kosong";
        if (!form.jurusan.trim()) newErrors.jurusan = "* Jurusan tidak boleh kosong";
        if (!form.semester) newErrors.semester = "* Semester tidak boleh kosong";
        if (!form.id_kasus.trim()) newErrors.id_kasus = "* ID Kasus tidak boleh kosong";
        if (!form.jenis_kasus.trim()) newErrors.jenis_kasus = "* Nama Kasus tidak boleh kosong";
        if (!form.status) newErrors.status = "* Status tidak boleh kosong";
        if (!form.deskripsi.trim()) newErrors.deskripsi = "* Deskripsi tidak boleh kosong";
        if (!form.foto) newErrors.foto = "* Foto harus diupload";
        if (!form.hasil_sidang) newErrors.hasil_sidang = "* Hasil sidang harus diupload";
        if (!form.notulensi) newErrors.notulensi = "* Notulensi harus diupload";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!token) {
            console.warn("❌ Token tidak ada");
            return;
        }

        try {
            if (!validateForm()) return;

            const mahasiswa = {
                nama: form.nama,
                nim: form.nim,
                jurusan: form.jurusan,
                semester: form.semester
            };

            const pelanggaran = {
                id_kasus: form.id_kasus,
                jenis_kasus: form.jenis_kasus,
                status: form.status,
                deskripsi: form.deskripsi,
            };

            const formData = new FormData();

            if (!editMode) {
                // Untuk tambah baru, kirim data mahasiswa juga               
                formData.append("mahasiswa", JSON.stringify(mahasiswa));
            }

            formData.append("pelanggaran", JSON.stringify(pelanggaran));

            if (form.hasil_sidang) {
                formData.append("hasil_sidang_path", form.hasil_sidang);
            }
            if (form.notulensi) {
                formData.append("notulensi_path", form.notulensi);
            }
            if (form.foto) {
                formData.append("photo_path", form.foto);
            }

            const url = editMode
                ? `http://localhost:3001/api/violations/${editId}`
                : "http://localhost:3001/api/violations";

            const res = await fetch(url, {
                method: editMode ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Gagal simpan pelanggaran");

            setSuccessMessage(editMode ? "Data kasus berhasil diperbarui!" : "Data kasus berhasil ditambahkan!");
            setOpenSuccessDialog(true);
            await fetchData();
            setOpenAddDialog(false);
            setForm({
                nama: '',
                nim: '',
                jurusan: '',
                semester: '',
                id_kasus: '',
                jenis_kasus: '',
                status: '',
                hasil_sidang: '',
                notulensi: '',
                foto: '',
                deskripsi: ''
            });
            setEditMode(false);
            setEditId(null);
        } catch (err) {
            console.error("Gagal simpan data:", err);
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

    const handleEdit = useCallback(async (row) => {
        if (!token) {
            console.warn("❌ Token tidak ada");
            return;
        }

        setEditMode(true);

        try {
            const res = await fetch(`http://localhost:3001/api/violations/${row.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Gagal ambil data");

            const data = await res.json();

            setForm({
                nama: data.mahasiswa?.nama || data.nama || "",
                nim: data.mahasiswa?.nim || data.nim || "",
                jurusan: data.mahasiswa?.jurusan || data.jurusan || "",
                semester: data.mahasiswa?.semester || data.semester || "",
                id_kasus: data.pelanggaran?.id_kasus || data.id_kasus || "",
                jenis_kasus: data.pelanggaran?.jenis_kasus || data.jenis_kasus || "",
                status: data.pelanggaran?.status || data.status || "",
                hasil_sidang: getFileNameFromPath(data.pelanggaran?.hasil_sidang || data.hasil_sidang),
                notulensi: getFileNameFromPath(data.pelanggaran?.notulensi || data.notulensi),
                foto: getFileNameFromPath(data.pelanggaran?.foto || data.foto),
                deskripsi: data.pelanggaran?.deskripsi || data.deskripsi || ""
            });

            setEditId(data.pelanggaran?.id || data.id);
            setOpenAddDialog(true);
        } catch (err) {
            console.error("❌ Gagal ambil data by ID:", err);
            alert("Gagal mengambil data pelanggaran.");
        }
    }, [token]);


    useEffect(() => {
        if (editData) {
            handleEdit(editData);
        }
    }, [editData, handleEdit]);

    const userPhoto = user?.photo
        ? `http://localhost:3001/uploads/profile/${user.photo}`
        : "/default-avatar.png";

    const filteredAndSortedViolations = violations
        .filter((row) =>
            Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        )
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
        { label: "Status Kasus", key: "status" },
        { label: "Approval", key: "status_approval" },
        { label: "Hasil Sidang", key: null },
        { label: "Notulensi", key: null },
        { label: "Edit", key: null }
    ];

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
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 5 }}>
                        Data Management
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Paper sx={{ display: 'flex', alignItems: 'center', p: '2px 8px', width: 240, borderRadius: 2, }} variant="outlined">
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
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenAddDialog}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#212121',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: '#000',
                                },
                                borderRadius: 2,
                                height: 40,
                            }}
                        >
                            Add New
                        </Button>
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
                                                size="small"
                                                disableElevation
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '999px',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    px: 2.5,
                                                    py: 0.5,
                                                    minWidth: 0,
                                                    bgcolor:
                                                        row.status_approval === 'Approved'
                                                            ? '#D1FAE5'
                                                            : row.status_approval === 'Rejected'
                                                                ? '#FEE2E2'
                                                                : '#FEF9C3',
                                                    color:
                                                        row.status_approval === 'Approved'
                                                            ? '#065F46'
                                                            : row.status_approval === 'Rejected'
                                                                ? '#991B1B'
                                                                : '#92400E',
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                {row.status_approval || 'Pending'}
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
                                        <TableCell>
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(row) }}>
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
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
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="md"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="600">
                        {editMode ? "Edit Kasus" : "Tambahkan Kasus Baru"}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 4, py: 3, overflowX: 'hidden' }}>
                    <Box
                        sx={{
                            border: '2px solid #ccc',
                            borderRadius: 2,
                            width: 820,
                            height: 180,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <Avatar variant="square" sx={{ width: 90, height: 90, mb: 2 }} src={form.foto ? `http://localhost:3001/uploads/temp/${form.foto}` : undefined} />
                        <Button
                            variant="contained"
                            component="label"
                            size="small"
                            sx={{
                                mt: 0.5,
                                bgcolor: '#000',
                                '&:hover': { bgcolor: '#333' },
                                textTransform: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.2,
                            }}
                        >
                            <CameraAltIcon fontSize="small" />
                            Upload Photo
                            <input
                                type="file"
                                hidden
                                accept="image/png, image/jpeg"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                                    if (!token) {
                                        alert('Token tidak ditemukan. Silakan login ulang.');
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append('file', file);

                                    try {
                                        const res = await fetch('http://localhost:3001/api/upload?type=photo', {
                                            method: 'POST',
                                            headers: {
                                                Authorization: `Bearer ${token}`
                                            },
                                            body: formData,
                                        });

                                        if (!res.ok) {
                                            const errData = await res.json();
                                            throw new Error(errData?.error || 'Upload gagal');
                                        }

                                        const data = await res.json();
                                        setForm((prev) => ({ ...prev, foto: data.file?.name || '' }));
                                        setErrors(prev => ({ ...prev, foto: '' }));
                                    } catch (err) {
                                        console.error('Upload gagal:', err);
                                        alert('Gagal upload foto.');
                                    }
                                }}
                            />
                            {errors.foto && <Typography variant="caption" color="error">{errors.foto}</Typography>}
                        </Button>
                        {/* {form.foto && (
                            <Box mt={2}>
                                <img
                                    src={`http://localhost:3001/uploads/temp/${form.foto}`}
                                    alt="Foto Mahasiswa"
                                    style={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover' }}
                                />
                            </Box>
                        )} */}
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2} mt={2}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Nama</Typography>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                value={form.nama}
                                error={!!errors.nama}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, nama: e.target.value }));
                                    setErrors(prev => ({ ...prev, nama: '' }));
                                }}
                            />
                            {errors.nama && <Typography variant="caption" color="error">{errors.nama}</Typography>}
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>NIM</Typography>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                value={form.nim}
                                error={!!errors.nim}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, nim: e.target.value }));
                                    setErrors(prev => ({ ...prev, nim: '' }));
                                }}
                            />
                            {errors.nim && <Typography variant="caption" color="error">{errors.nim}</Typography>}
                        </Box>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Prodi</Typography>
                            <Select
                                fullWidth
                                size="small"
                                value={form.jurusan || ''}
                                displayEmpty
                                error={!!errors.jurusan}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, jurusan: e.target.value }));
                                    setErrors(prev => ({ ...prev, jurusan: '' }));
                                }}
                            >
                                <MenuItem value="">Pilih Prodi</MenuItem>
                                <MenuItem value="Informatika">Informatika</MenuItem>
                                <MenuItem value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</MenuItem>
                                <MenuItem value="Teknologi Informasi">Teknologi Informasi</MenuItem>
                                <MenuItem value="Data Sains">Data Sains</MenuItem>
                            </Select>
                            {errors.jurusan && (
                                <Typography variant="caption" color="error">{errors.jurusan}</Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Semester</Typography>
                            <OutlinedInput
                                fullWidth
                                type="number"
                                size="small"
                                value={form.semester}
                                error={!!errors.semester}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, semester: e.target.value }));
                                    setErrors(prev => ({ ...prev, semester: '' }));
                                }}
                            />
                            {errors.semester && <Typography variant="caption" color="error">{errors.semester}</Typography>}
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Nama Kasus</Typography>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                value={form.jenis_kasus}
                                error={!!errors.jenis_kasus}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, jenis_kasus: e.target.value }));
                                    setErrors(prev => ({ ...prev, jenis_kasus: '' }));
                                }}
                            />
                            {errors.jenis_kasus && <Typography variant="caption" color="error">{errors.jenis_kasus}</Typography>}
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>ID Kasus</Typography>
                            <OutlinedInput
                                fullWidth
                                size="small"
                                value={form.id_kasus}
                                error={!!errors.id_kasus}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, id_kasus: e.target.value }));
                                    setErrors(prev => ({ ...prev, id_kasus: '' }));
                                }}
                            />
                            {errors.id_kasus && <Typography variant="caption" color="error">{errors.id_kasus}</Typography>}
                        </Box>
                    </Box>
                    <Box mb={3}>
                        <Typography fontSize={14} fontWeight={500} mb={0.5}>Case Description</Typography>
                        <OutlinedInput
                            fullWidth
                            size="small"
                            multiline
                            minRows={3}
                            value={form.deskripsi}
                            error={!!errors.deskripsi}
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, deskripsi: e.target.value }));
                                setErrors(prev => ({ ...prev, deskripsi: '' }));
                            }}
                        />
                        {errors.deskripsi && <Typography variant="caption" color="error">{errors.deskripsi}</Typography>}
                    </Box>
                    <Box mb={4}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Status</Typography>
                            <Select
                                fullWidth
                                size="small"
                                value={form.status}
                                error={!!errors.status}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, status: e.target.value }));
                                    setErrors(prev => ({ ...prev, status: '' }));
                                }}
                            >
                                <MenuItem value="">Pilih Status</MenuItem>
                                <MenuItem value={1}>Berjalan</MenuItem>
                                <MenuItem value={2}>Tertunda</MenuItem>
                                <MenuItem value={3}>Selesai</MenuItem>
                                <MenuItem value={4}>Dibatalkan</MenuItem>
                            </Select>
                            {errors.status && <Typography variant="caption" color="error">{errors.status}</Typography>}
                        </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={3} mb={1}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Hasil Sidang</Typography>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' }, textTransform: 'none' }}
                                >
                                    Upload
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.doct,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                                            if (!token) {
                                                alert('Token tidak ditemukan. Silakan login ulang.');
                                                return;
                                            }

                                            const formData = new FormData();
                                            formData.append('file', file);

                                            try {
                                                const res = await fetch('http://localhost:3001/api/upload?type=hasil', {
                                                    method: 'POST',
                                                    headers: {
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                    body: formData,
                                                });

                                                if (!res.ok) {
                                                    const errData = await res.json();
                                                    throw new Error(errData?.error || 'Upload gagal');
                                                }

                                                const data = await res.json();
                                                setForm((prev) => ({ ...prev, hasil_sidang: data.file?.name || '' }));
                                                setErrors(prev => ({ ...prev, hasil_sidang: '' }));
                                            } catch (err) {
                                                console.error('Upload gagal:', err);
                                                alert('Gagal upload hasil sidang.');
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>
                            <IconButton
                                aria-label="delete"
                                size="medium"
                                sx={{ mt: 2.8 }}
                                onClick={() => {
                                    setForm(prev => ({ ...prev, hasil_sidang: '' }));
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                            {form.hasil_sidang && (
                                <Typography variant="body2" sx={{ mt: 2.5 }}>
                                    {form.hasil_sidang}
                                </Typography>
                            )}
                        </Box>
                        {errors.hasil_sidang && <Typography variant="caption" color="error">{errors.hasil_sidang}</Typography>}
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Notulensi</Typography>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' }, textTransform: 'none' }}
                                >
                                    Upload
                                    <input
                                        type="file"
                                        hidden
                                        accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                                            if (!token) {
                                                alert('Token tidak ditemukan. Silakan login ulang.');
                                                return;
                                            }

                                            const formData = new FormData();
                                            formData.append('file', file);

                                            try {
                                                const res = await fetch('http://localhost:3001/api/upload?type=notulensi', {
                                                    method: 'POST',
                                                    headers: {
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                    body: formData,
                                                });

                                                if (!res.ok) {
                                                    const errData = await res.json();
                                                    throw new Error(errData?.error || 'Upload gagal');
                                                }

                                                const data = await res.json();
                                                setForm((prev) => ({ ...prev, notulensi: data.file?.name || '' }));
                                                setErrors(prev => ({ ...prev, notulensi: '' }));
                                            } catch (err) {
                                                console.error('Upload gagal:', err);
                                                alert('Gagal upload notulensi.');
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>
                            <IconButton
                                aria-label="delete"
                                size="medium"
                                sx={{ mt: 2.8 }}
                                onClick={() => {
                                    setForm(prev => ({ ...prev, notulensi: '' }));
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                            {form.notulensi && (
                                <Typography variant="body2" sx={{ mt: 2.5 }}>
                                    {form.notulensi}
                                </Typography>
                            )}
                        </Box>
                        {errors.notulensi && <Typography variant="caption" color="error">{errors.notulensi}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 6, pb: 2, pt: 2 }}>
                    <Box flexGrow={1} />
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
                    >
                        {editMode ? 'Update' : 'Save'}
                    </Button>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        variant="contained"
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}>
                        Back
                    </Button>
                </DialogActions>
            </Dialog>
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
                open={openUploadHasil}
                onClose={() => setOpenUploadHasil(false)}
                sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}
            >
                <DialogContent>
                    <FileUpload
                        type="hasil"
                        onUploaded={(data) => {
                            setForm((prev) => ({
                                ...prev,
                                hasil_sidang: data.file.name,
                            }));
                            setOpenUploadHasil(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={openUploadNotulensi}
                onClose={() => setOpenUploadNotulensi(false)}
                sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}
            >
                <DialogContent>
                    <FileUpload
                        type="notulensi"
                        onUploaded={(data) => {
                            setForm((prev) => ({
                                ...prev,
                                notulensi: data.file.name,
                            }));
                            setOpenUploadNotulensi(false);
                        }}
                    />
                </DialogContent>
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
                                        src={`http://localhost:3001/uploads/data_pelanggaran/photo/${selectedCase.foto || ''}`}
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
                                            <Typography variant="caption" color="text.secondary">Jurusan</Typography>
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
                                        <Typography>Trial Result Document</Typography>
                                    </Box>
                                    <Button
                                        onClick={() =>
                                            downloadExport({
                                                id: selectedCase.id,
                                                type: 'hasil_sidang',
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
                                        <Typography>Minutes of Meeting</Typography>
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
                                handleEdit(selectedCase);
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
            <Dialog
                open={openSuccessDialog}
                onClose={() => setOpenSuccessDialog(false)}
                sx={{ '& .MuiDialog-paper': { borderRadius: 3, minWidth: 300 } }}
            >
                <DialogTitle sx={{ textAlign: 'center', mt: 1 }}>
                    Berhasil
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography>{successMessage}</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                        onClick={() => setOpenSuccessDialog(false)}
                        variant="contained"
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default DataManagement;
