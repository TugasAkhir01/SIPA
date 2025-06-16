import React, { useEffect, useCallback } from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, InputBase, Paper,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Menu, Dialog, DialogTitle,
    DialogContent, DialogActions, ListItemIcon, OutlinedInput,
} from "@mui/material";
import { PictureAsPdfRounded, DescriptionRounded } from "@mui/icons-material";
import { Person, Logout, Menu as MenuIcon, Search as SearchIcon, CameraAlt as CameraAltIcon } from "@mui/icons-material";
import EditOutlined from '@mui/icons-material/EditOutlined';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Sidebar from "../sidebar/Sidebar";
import FileUpload from "./fileupload.js";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const DataManagement = () => {
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

    React.useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const [openAddDialog, setOpenAddDialog] = React.useState(false);

    const [openUploadHasil, setOpenUploadHasil] = React.useState(false);
    const [openUploadNotulensi, setOpenUploadNotulensi] = React.useState(false);

    const [violations, setViolations] = React.useState([]);
    const [form, setForm] = React.useState({
        nama: '',
        nim: '',
        jurusan: '',
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

    const handleSave = async () => {
        if (!token) {
            console.warn("❌ Token tidak ada");
            return;
        }

        try {
            if (!form.nama || !form.nim || !form.jurusan || !form.id_kasus) {
                alert("Mohon lengkapi semua data!");
                return;
            }

            const mahasiswa = {
                nama: form.nama,
                nim: form.nim,
                jurusan: form.jurusan,
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

            alert(editMode ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!");
            await fetchData();
            setOpenAddDialog(false);
            setForm({
                nama: '',
                nim: '',
                jurusan: '',
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

    const handleEdit = async (row) => {
        if (!token) {
            console.warn("❌ Token tidak ada");
            return;
        }

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
                id_kasus: data.pelanggaran?.id_kasus || data.id_kasus || "",
                jenis_kasus: data.pelanggaran?.jenis_kasus || data.jenis_kasus || "",
                status: data.pelanggaran?.status || data.status || "",
                hasil_sidang: getFileNameFromPath(data.pelanggaran?.hasil_sidang || data.hasil_sidang),
                notulensi: getFileNameFromPath(data.pelanggaran?.notulensi || data.notulensi),
                foto: getFileNameFromPath(data.pelanggaran?.foto || data.foto),
                deskripsi: data.pelanggaran?.deskripsi || data.deskripsi || ""
            });

            setEditMode(true);
            setEditId(data.pelanggaran?.id || data.id);
            setOpenAddDialog(true);
        } catch (err) {
            console.error("❌ Gagal ambil data by ID:", err);
            alert("Gagal mengambil data pelanggaran.");
        }
    };

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
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 5 }}>
                        Data Management
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Paper sx={{ display: 'flex', alignItems: 'center', p: '2px 8px', width: 240, borderRadius: 2, }} variant="outlined">
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
                                    },
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
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditMode(false);
                                setEditId(null);
                                setForm({
                                    nama: '',
                                    nim: '',
                                    jurusan: '',
                                    id_kasus: '',
                                    jenis_kasus: '',
                                    status: '',
                                    hasil_sidang: '',
                                    notulensi: '',
                                    foto: '',
                                    deskripsi: ''
                                });
                                setOpenAddDialog(true);
                            }}
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
                                    {[
                                        "No.",
                                        "Nama",
                                        "NIM",
                                        "Jurusan",
                                        "ID Kasus",
                                        "Jenis Kasus",
                                        "Status",
                                        "Hasil Sidang",
                                        "Notulensi",
                                        "Edit"
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
                                                component="a"
                                                href={row.hasil_sidang}
                                                target="_blank"
                                                rel="noopener noreferrer"
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
                                                View
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                component="a"
                                                href={row.notulensi}
                                                target="_blank"
                                                rel="noopener noreferrer"
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
                                            <IconButton onClick={() => handleEdit(row)}>
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
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
                <DialogContent dividers sx={{ px: 4, py: 3 }}>
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
                                accept="image/*"
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
                                    } catch (err) {
                                        console.error('Upload gagal:', err);
                                        alert('Gagal upload foto.');
                                    }
                                }}
                            />
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
                                placeholder="Masukkan Nama"
                                size="small"
                                value={form.nama}
                                onChange={(e) => setForm(prev => ({ ...prev, nama: e.target.value }))}
                            />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>NIM</Typography>
                            <OutlinedInput
                                fullWidth
                                placeholder="Masukkan NIM"
                                size="small"
                                value={form.nim}
                                onChange={(e) => setForm(prev => ({ ...prev, nim: e.target.value }))}
                            />
                        </Box>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Jurusan</Typography>
                            <OutlinedInput
                                fullWidth
                                placeholder="Masukkan Jurusan"
                                size="small"
                                value={form.jurusan}
                                onChange={(e) => setForm(prev => ({ ...prev, jurusan: e.target.value }))}
                            />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Nama Kasus</Typography>
                            <OutlinedInput
                                fullWidth
                                placeholder="Masukkan Nama Kasus"
                                size="small"
                                value={form.jenis_kasus}
                                onChange={(e) => setForm(prev => ({ ...prev, jenis_kasus: e.target.value }))}
                            />
                        </Box>
                    </Box>
                    <Box mb={3}>
                        <Typography fontSize={14} fontWeight={500} mb={0.5}>Case Description</Typography>
                        <OutlinedInput
                            fullWidth
                            placeholder="Masukkan Deskripsi Kasus"
                            multiline
                            minRows={3}
                            value={form.deskripsi}
                            onChange={(e) => setForm(prev => ({ ...prev, deskripsi: e.target.value }))}
                        />
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={4}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>ID Kasus</Typography>
                            <OutlinedInput
                                fullWidth
                                placeholder="Masukkan ID Kasus"
                                size="small"
                                value={form.id_kasus}
                                onChange={(e) => setForm(prev => ({ ...prev, id_kasus: e.target.value }))}
                            />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Status</Typography>
                            <Select
                                fullWidth
                                displayEmpty
                                size="small"
                                value={form.status}
                                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <MenuItem value="">Pilih Status</MenuItem>
                                <MenuItem value={1}>Berjalan</MenuItem>
                                <MenuItem value={2}>Tertunda</MenuItem>
                                <MenuItem value={3}>Selesai</MenuItem>
                                <MenuItem value={4}>Dibatalkan</MenuItem>
                            </Select>
                        </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={3} mb={1}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Hasil Sidang</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => setOpenUploadHasil(true)}
                                    sx={{
                                        width: 120,
                                        bgcolor: '#000',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                >
                                    Upload
                                </Button>
                            </Box>
                            <IconButton aria-label="delete" size="medium" sx={{ mt: 2.8 }}>
                                <DeleteIcon />
                            </IconButton>
                            {form.hasil_sidang && (
                                <Typography variant="body2" sx={{ mt: 2.5 }}>
                                    {form.hasil_sidang}
                                </Typography>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Notulensi Sidang</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => setOpenUploadNotulensi(true)}
                                    sx={{
                                        width: 120,
                                        bgcolor: '#000',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                >
                                    Upload
                                </Button>
                            </Box>
                            <IconButton aria-label="delete" size="medium" sx={{ mt: 2.8 }}>
                                <DeleteIcon />
                            </IconButton>
                            {form.notulensi && (
                                <Typography variant="body2" sx={{ mt: 2.5 }}>
                                    {form.notulensi}
                                </Typography>
                            )}
                        </Box>
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
        </Box >
    );
};

export default DataManagement;
