import React from "react";
import {
    AppBar, Toolbar, IconButton, Typography, Avatar, Menu, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
    ListItemIcon, TableContainer, Paper, Table, TableHead, TableRow,
    TableCell, TableBody, Pagination, InputBase
} from "@mui/material";
import {
    Menu as MenuIcon, Person, Logout, Visibility, Edit, Delete
} from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from "../sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

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

    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState(null);

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
    const openMenu = Boolean(anchorEl);

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
        try {
            const res = await fetch(`http://localhost:3001/api/users/update-without-photo/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(selectedUser),
            });

            if (!res.ok) {
                throw new Error("Gagal mengupdate user");
            }

            const updatedUser = await res.json();

            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );

            setEditDialogOpen(false);
        } catch (err) {
            console.error("Error saat update user:", err);
            alert("Terjadi kesalahan saat mengupdate data.");
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

    return (
        <Box>
            <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: theme.palette.primary.main }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <MenuIcon />
                        </IconButton>
                        <IconButton>
                            <img src="/logo192.png" alt="Logo" width={30} />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 1, color: theme.palette.text.primary }}>
                            Website Pendataan Pelanggaran Akademik
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            onClick={handleClick}
                            sx={{
                                display: "flex", alignItems: "center", cursor: "pointer", px: 1, py: 0.5,
                                borderRadius: 1, "&:hover": { backgroundColor: theme.palette.action.hover }
                            }}
                        >
                            <Avatar alt={userName} src={user?.foto || "/default-avatar.png"} sx={{ width: 36, height: 36, mr: 1 }} />
                            <Typography variant="h6" fontSize={16}>{userName}</Typography>
                        </Box>
                        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} onClick={handleClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}>
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
            <Box display="flex" height="100vh">
                {sidebarOpen && (
                    <Sidebar user={{
                        name: user?.nama || "User",
                        nip: user?.nip || "-",
                        role: user?.role || "-",
                        photo: user?.foto || "/default-avatar.png"
                    }} />
                )}
                <Box flex={1} p={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" fontWeight="bold">User Management</Typography>
                        <Paper sx={{ display: "flex", alignItems: "center", p: "2px 8px", width: 240, mb: "15px" }} variant="outlined">
                            <SearchIcon sx={{ mr: 1 }} />
                            <InputBase placeholder="Cari data..." fullWidth />
                        </Paper>
                    </Box>

                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>NIP</TableCell>
                                    <TableCell>Nama</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Posisi</TableCell>
                                    <TableCell>Password</TableCell>
                                    <TableCell>Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.nip}</TableCell>
                                        <TableCell>{row.nama}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.role}</TableCell>
                                        <TableCell>
                                            {showPasswords[row.id] ? row.password : "********"}
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => togglePassword(row.id)}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" onClick={() => handleEditUser(row)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            {user?.role === "super admin" && (
                                                <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(row)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Menampilkan daftar user</Typography>
                        <Pagination count={3} shape="rounded" />
                    </Box>
                </Box>
            </Box>
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
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
                        <Box sx={{ position: "relative", width: "100%" }}>
                            <select
                                value={selectedUser?.role || ""}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, role: e.target.value })
                                }
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    width: "100%",
                                    height: "50px",
                                    appearance: "none",
                                    WebkitAppearance: "none",
                                    MozAppearance: "none",
                                }}
                            >
                                <option value="super admin">Super Admin</option>
                                <option value="wakil dekan">Wakil Dekan</option>
                                <option value="akademik">Akademik</option>
                                <option value="kemahasiswaan">Kemahasiswaan</option>
                            </select>
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: 16,
                                    top: "55%",
                                    transform: "translateY(-50%)",
                                    pointerEvents: "none",
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    fill="gray"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </Box>
                        </Box>
                        <Typography>
                            Password
                        </Typography>
                        <Box sx={{ position: "relative" }}>
                            <InputBase
                                placeholder="Password"
                                fullWidth
                                type={showPasswords[selectedUser?.id] ? "text" : "password"}
                                value={selectedUser?.password || ""}
                                onChange={(e) =>
                                    setSelectedUser({ ...selectedUser, password: e.target.value })
                                }
                                sx={{ border: "1px solid #ccc", borderRadius: 1, px: 2, py: 1, pr: 5 }}
                            />
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setShowPasswords((prev) => ({
                                        ...prev,
                                        [selectedUser?.id]: !prev[selectedUser?.id],
                                    }))
                                }
                                sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} sx={{ backgroundColor: "#e0e0e0" }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateUser}
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
