import React from "react";
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

    const user = React.useMemo(() => {
        return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user"));
    }, []);

    const userName = user?.nama || "User";

    React.useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const [openAddDialog, setOpenAddDialog] = React.useState(false);

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
                            <Avatar
                                alt={userName}
                                src={user?.foto || "/default-avatar.png"}
                                sx={{ width: 36, height: 36, mr: 1 }}
                            />
                            <Typography variant="h6" fontWeight="bold" fontSize={16} sx={{ color: "#fff" }}>
                                {userName}
                            </Typography>
                        </Box>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem>
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
                {sidebarOpen && (
                    <Sidebar user={{
                        name: user?.nama || "User",
                        nip: user?.nip || "-",
                        role: user?.role || "-",
                        photo: user?.foto || "/default-avatar.png"
                    }} />
                )}
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
                            onClick={() => setOpenAddDialog(true)}
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
                                {[1, 2, 3].map((row) => (
                                    <TableRow key={row}>
                                        <TableCell>{row}</TableCell>
                                        <TableCell>Lorem</TableCell>
                                        <TableCell>00000000</TableCell>
                                        <TableCell>Lorem</TableCell>
                                        <TableCell>XX-00-XX</TableCell>
                                        <TableCell>Lorem</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                disableElevation
                                                sx={{
                                                    bgcolor: row === 1 ? "#28A745" : row === 2 ? "#F6404F" : "#DEE2E6",
                                                    color: row === 3 ? "#000" : "#fff",
                                                    borderRadius: "50px",
                                                    px: 2,
                                                    textTransform: "none",
                                                    fontWeight: 500,
                                                    minWidth: 80,
                                                    fontSize: 13,
                                                }}
                                            >
                                                {row === 1 ? "Selesai" : row === 2 ? "Berjalan" : "Tertunda"}
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
                                        <TableCell>
                                            <IconButton size="small" color="#000" sx={{ mx: 0.5 }}>
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
                    <Typography variant="h6" fontWeight="bold">Tambahkan Kasus Baru</Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ px: 4, py: 3 }}>
                    <Box display="flex" justifyContent="center" mb={4}>
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                width: 280,
                                height: 180,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                bgcolor: '#fafafa',
                            }}
                        >
                            <Avatar sx={{ width: 72, height: 72, mb: 2 }} />
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    mt: 1,
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
                            </Button>

                        </Box>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>NIM</Typography>
                            <OutlinedInput fullWidth placeholder="Masukkan NIM" size="small" />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Jurusan</Typography>
                            <OutlinedInput fullWidth placeholder="Masukkan Jurusan" size="small" />
                        </Box>
                    </Box>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>ID Kasus</Typography>
                            <OutlinedInput fullWidth placeholder="Masukkan ID Kasus" size="small" />
                        </Box>
                        <Box>
                            <Typography fontSize={14} fontWeight={500} mb={0.5}>Nama Kasus</Typography>
                            <OutlinedInput fullWidth placeholder="Masukkan Nama Kasus" size="small" />
                        </Box>
                    </Box>
                    <Box mb={3}>
                        <Typography fontSize={14} fontWeight={500} mb={0.5}>Case Description</Typography>
                        <OutlinedInput
                            fullWidth
                            placeholder="Masukkan Deskripsi Kasus"
                            multiline
                            minRows={3}
                        />
                    </Box>
                    <Box mb={4}>
                        <Typography fontSize={14} fontWeight={500} mb={0.5}>Status</Typography>
                        <Select fullWidth displayEmpty defaultValue="" size="small" >
                            <MenuItem value="" disabled>Select Status</MenuItem>
                            <MenuItem value="Selesai">Selesai</MenuItem>
                            <MenuItem value="Berjalan">Berjalan</MenuItem>
                            <MenuItem value="Tertunda">Tertunda</MenuItem>
                        </Select>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={3} mb={1}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Hasil Sidang</Typography>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    sx={{
                                        width: 120,
                                        bgcolor: '#000',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                >
                                    Upload
                                    <input type="file" hidden />
                                </Button>
                            </Box>
                            <IconButton aria-label="delete" size="medium" sx={{ mt: 3 }}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box>
                                <Typography fontSize={14} fontWeight={500} mb={0.5}>Notulensi Sidang</Typography>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<UploadIcon />}
                                    sx={{
                                        width: 120,
                                        bgcolor: '#000',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#333' }
                                    }}
                                >
                                    Upload
                                    <input type="file" hidden />
                                </Button>
                            </Box>
                            <IconButton aria-label="delete" size="medium" sx={{ mt: 3 }}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 6, pb: 2, pt: 2 }}>
                    <Box flexGrow={1} />
                    <Button
                        variant="contained"
                        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}>
                        Save
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
        </Box>
    );
};

export default DataManagement;
