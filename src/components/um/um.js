import React from "react";
import {
    AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    ListItemIcon, TableContainer, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, InputBase, FormControl, Select
} from "@mui/material";
import {
    Menu as MenuIcon, Person, Logout, Visibility, Delete, Add
} from "@mui/icons-material";
import EditOutlined from '@mui/icons-material/EditOutlined';
import Sidebar from "../sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const validatePassword = (password) => {
    const errors = [];
    if (!/.{6,}/.test(password)) errors.push("Minimal 6 karakter");
    if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf kapital");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("Minimal 1 simbol");
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) errors.push("Kombinasi huruf dan angka");
    return errors;
};

const UserManagement = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [users, setUsers] = React.useState([]);

    const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user"));
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const userName = user?.nama || "User";
    const [showPasswords, setShowPasswords] = React.useState({});
    const [showEditPassword, setShowEditPassword] = React.useState(false);

    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState(null);

    const [newUserPasswordError, setNewUserPasswordError] = React.useState([]);
    const [editUserPasswordError, setEditUserPasswordError] = React.useState([]);

    const togglePassword = (userId) => {
        setShowPasswords((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    React.useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) throw new Error("Gagal mengambil data");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Error:", error);
                navigate("/");
            }
        };

        fetchUsers();
    }, [token, navigate]);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const open = Boolean(anchorEl);

    const handleSignOut = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        navigate("/");
    };

    const handleDeleteUser = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Gagal menghapus user");
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Gagal hapus:", err);
        }
    };

    const handleUpdateUser = async () => {
        const passwordErrors = validatePassword(selectedUser.password);
        if (passwordErrors.length > 0) {
            setEditUserPasswordError(passwordErrors);
            return;
        }

        try {
            const roleMap = {
                admin: 1,
                staff: 2,
                user: 3,
            };

            const payload = {
                nip: selectedUser.nip,
                nama: selectedUser.nama,
                email: selectedUser.email,
                password: selectedUser.password,
                role_id: roleMap[selectedUser.role],
                no_telp: selectedUser.no_telp || "+62",
                fakultas: selectedUser.fakultas || "Informatika",
                jurusan: selectedUser.jurusan || "Rekayasa Perangkat Lunak",
            };

            const res = await fetch(`http://localhost:3001/api/users/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                console.error("Server error response:", result);
                alert("Gagal mengupdate data: " + (result?.message || 'Terjadi kesalahan'));
                return;
            }

            const updatedUser = {
                ...selectedUser,
                ...payload,
            };

            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );

            setEditDialogOpen(false);
        } catch (err) {
            console.error("Error saat update user:", err);
            alert("Terjadi kesalahan saat mengupdate data.");
        }
    };

    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [newUser, setNewUser] = React.useState({
        nip: "", nama: "", email: "", password: "", role: "", photo: ""
    });
    const [showAddPassword, setShowAddPassword] = React.useState(false);

    const handleCreateUser = async () => {
        const passwordErrors = validatePassword(newUser.password);
        if (passwordErrors.length > 0) {
            setNewUserPasswordError(passwordErrors);
            return;
        }

        try {
            const roleMap = {
                admin: 1,
                staff: 2,
                user: 3,
            };

            const payload = {
                nip: newUser.nip,
                nama: newUser.nama,
                email: newUser.email,
                password: newUser.password,
                role_id: roleMap[newUser.role],
                no_telp: newUser.no_telp || "+62",
                fakultas: newUser.fakultas || "Informatika",
                jurusan: newUser.jurusan || "Rekayasa Perangkat Lunak",
                photo: newUser.photo || null,
            };

            const res = await fetch("http://localhost:3001/api/users/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Error response from server:", data);
                throw new Error("Gagal menambah user");
            }

            setUsers((prev) => [...prev, { ...newUser, id: data.userId }]);
            setOpenAddDialog(false);
            setNewUser({
                nip: "",
                nama: "",
                email: "",
                password: "",
                role: "",
                no_telp: "",
                fakultas: "",
                jurusan: "",
                photo: ""
            });
        } catch (err) {
            console.error("Gagal menambahkan user:", err);
            alert("Terjadi kesalahan saat menambahkan user.");
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleOpenDeleteDialog = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
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
                <Box flex={1} p={3} mt={5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" fontWeight="bold">User Management</Typography>
                        <Button
                            onClick={() => setOpenAddDialog(true)}
                            variant="contained"
                            startIcon={<Add />}
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
                            Add User
                        </Button>
                    </Box>
                    <TableContainer
                        component={Paper}
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            boxShadow: 2,
                            overflowX: "auto",
                        }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f9f9f9" }} >
                                    <TableCell sx={{ fontWeight: "bold" }}>NIP</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Nama</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Posisi</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Password</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: "bold" }}>Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users
                                    .filter((row) => row.role !== 0 && row.role.toLowerCase() !== "super admin")
                                    .map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.nip}</TableCell>
                                            <TableCell>{row.nama}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>
                                                {row.role
                                                    ? row.role
                                                        .split(" ")
                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(" ")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <span>{showPasswords[row.id] ? row.password : "********"}</span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => togglePassword(row.id)}
                                                        style={{
                                                            marginLeft: 4,
                                                            padding: 4,
                                                            position: "relative",
                                                            top: showPasswords[row.id] ? "-1px" : "-4px"
                                                        }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" color="#000" sx={{ mx: 0.5 }} onClick={() => handleEditUser(row)}>
                                                    <EditOutlined fontSize="small" />
                                                </IconButton>
                                                {user?.role === "super admin" && (
                                                    <IconButton size="small" color="error" sx={{ mx: 0.5 }} onClick={() => handleOpenDeleteDialog(row)}>
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                )}
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
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Tambah User Baru</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Typography>NIP</Typography>
                        <InputBase
                            placeholder="NIP"
                            fullWidth
                            value={newUser.nip}
                            onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>Nama</Typography>
                        <InputBase
                            placeholder="Nama"
                            fullWidth
                            value={newUser.nama}
                            onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>Email</Typography>
                        <InputBase
                            placeholder="Email"
                            fullWidth
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>Posisi</Typography>
                        <FormControl fullWidth>
                            <Select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                displayEmpty
                                sx={{ borderRadius: "8px", fontWeight: "bold", height: "50px", pl: 0.5 }}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="staff">Staff</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                            </Select>
                        </FormControl>
                        <Typography>Password</Typography>
                        <Box>
                            <Box sx={{ position: "relative" }}>
                                <InputBase
                                    placeholder="Password"
                                    fullWidth
                                    type={showAddPassword ? "text" : "password"}
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    error={newUserPasswordError.length > 0}
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: 1,
                                        px: 2,
                                        py: 1,
                                        pr: 5,
                                        height: 48,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setShowAddPassword((prev) => !prev)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#666",
                                    }}
                                >
                                    <Visibility fontSize="small" />
                                </IconButton>
                            </Box>

                            {newUserPasswordError.length > 0 && (
                                <Box mt={0.5} ml={1}>
                                    {newUserPasswordError.map((err, idx) => (
                                        <Typography key={idx} color="error" fontSize={12}>
                                            • {err}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        sx={{
                            backgroundColor: "#fff",
                            color: "#000",
                            fontWeight: "bold",
                            border: "2px solid #D1D5DB",
                            borderRadius: "16px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "#f3f4f6",
                                borderColor: "#D1D5DB",
                            },
                        }}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateUser}
                        sx={{
                            backgroundColor: "#1F1F1F",
                            color: "#fff",
                            fontWeight: "bold",
                            borderRadius: "16px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "#333333",
                            },
                        }}
                    >
                        Tambah User
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Edit User</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <Typography>
                            NIP
                        </Typography>
                        <InputBase
                            placeholder="NIP"
                            fullWidth
                            value={selectedUser?.nip || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, nip: e.target.value })
                            }
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>
                            Nama
                        </Typography>
                        <InputBase
                            placeholder="Nama"
                            fullWidth
                            value={selectedUser?.nama || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, nama: e.target.value })
                            }
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>
                            Email
                        </Typography>
                        <InputBase
                            placeholder="Email"
                            fullWidth
                            value={selectedUser?.email || ""}
                            onChange={(e) =>
                                setSelectedUser({ ...selectedUser, email: e.target.value })
                            }
                            sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1 }}
                        />
                        <Typography>
                            Posisi
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={selectedUser?.role || ""}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, role: e.target.value })
                                }
                                displayEmpty
                                sx={{
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    height: "50px",
                                    pl: 0.9,
                                    backgroundColor:
                                        selectedUser?.role === "akademik"
                                            ? "#FFFFFF"
                                            : "#F8F9FA",
                                    "& .MuiSelect-select": {
                                        padding: "10px",
                                        fontWeight: "bold",
                                    },
                                }}
                            >
                                <MenuItem
                                    value="admin"
                                    sx={{ backgroundColor: "#F8F9FA", fontWeight: "bold" }}
                                >
                                    Admin
                                </MenuItem>
                                <MenuItem
                                    value="staff"
                                    sx={{ backgroundColor: "#FFFFFF", fontWeight: "bold" }}
                                >
                                    Staff
                                </MenuItem>
                                <MenuItem
                                    value="user"
                                    sx={{ backgroundColor: "#F8F9FA", fontWeight: "bold" }}
                                >
                                    User
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Typography>
                            Password
                        </Typography>
                        <Box>
                            <Box sx={{ position: "relative" }}>
                                <InputBase
                                    placeholder="Password"
                                    fullWidth
                                    type={showEditPassword ? "text" : "password"}
                                    value={selectedUser?.password || ""}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                                    error={editUserPasswordError.length > 0}
                                    sx={{
                                        border: "1px solid #ccc",
                                        borderRadius: 1,
                                        px: 2,
                                        py: 1,
                                        pr: 5,
                                        height: 48,
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setShowEditPassword((prev) => !prev)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#666",
                                    }}
                                >
                                    <Visibility fontSize="small" />
                                </IconButton>
                            </Box>

                            {editUserPasswordError.length > 0 && (
                                <Box mt={0.5} ml={1}>
                                    {editUserPasswordError.map((err, idx) => (
                                        <Typography key={idx} color="error" fontSize={12}>
                                            • {err}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        sx={{
                            backgroundColor: "#fff",
                            color: "#000",
                            fontWeight: "bold",
                            border: "2px solid #D1D5DB",
                            borderRadius: "16px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "#f3f4f6",
                                borderColor: "#D1D5DB",
                            },
                        }}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateUser}
                        sx={{
                            backgroundColor: "#1F1F1F",
                            color: "#fff",
                            fontWeight: "bold",
                            borderRadius: "16px",
                            px: 4,
                            py: 1.5,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "#333333",
                            },
                        }}
                    >
                        Simpan Perubahan
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogContent>
                    <Typography>Apakah Anda yakin ingin menghapus user <strong>{userToDelete?.nama}</strong>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Batal</Button>
                    <Button
                        onClick={() => {
                            handleDeleteUser(userToDelete.id);
                            setDeleteDialogOpen(false);
                        }}
                        variant="contained"
                        color="error"
                    >
                        Hapus
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
                    <Typography variant="body2">Apakah Anda yakin ingin keluar dari akun ini?</Typography>
                </DialogContent>
                <DialogActions sx={{ mr: 2, mb: 2, gap: 1 }}>
                    <Button onClick={() => setLogoutDialogOpen(false)} color="primary" variant="outlined">Batal</Button>
                    <Button onClick={handleSignOut} color="error" variant="contained">Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
