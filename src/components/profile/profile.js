import React from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, TextField,
    Grid, Paper, MenuItem, Button, Avatar, Menu, Dialog,
    DialogTitle, DialogContent, DialogActions, ListItemIcon
} from "@mui/material";
import {
    Person, Logout, Menu as MenuIcon, Edit as EditIcon, CameraAlt as CameraAltIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../sidebar/Sidebar";

const Profile = () => {
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
        const sessionUser = sessionStorage.getItem("user");
        const localUser = localStorage.getItem("user");
        return sessionUser ? JSON.parse(sessionUser) : (localUser ? JSON.parse(localUser) : null);
    }, []);

    React.useEffect(() => {
        if (!user) navigate("/");
    }, [user, navigate]);

    const userName = user?.nama || "User";
    const userPhoto = user?.foto || "/default-avatar.png";

    return (
        <Box minHeight="100vh" display="flex" flexDirection="column">
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
                <Box flexGrow={1} bgcolor="#f5f5f5" p={3} overflowY="auto">
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={3} maxWidth={800} mx="auto" mt={4}>
                            <Box position="relative">
                                <Avatar
                                    src={userPhoto}
                                    alt={userName}
                                    sx={{ width: 150, height: 150 }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: "calc(50% - 16px)",
                                        ":hover": { backgroundColor: "#eee" },
                                    }}
                                >
                                    <CameraAltIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="h6">{userName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    NIP: {user?.nip || "-"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Role: {user?.role || "-"}
                                </Typography>
                            </Box>
                            <Box ml="auto" mr={6}>
                                <IconButton color="primary">
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box mt={5} maxWidth={800} mx="auto" mb={6}>
                            <Typography variant="h6" gutterBottom>
                                Contact Information
                            </Typography>
                            <Grid container spacing={6} sx={{ mt: 4 }}>
                                {[
                                    { label: "Nama", value: user?.nama },
                                    { label: "NIP", value: user?.nip },
                                    { label: "Email", value: user?.email },
                                    { label: "Nomor Telp.", value: user?.telp },
                                    { label: "Fakultas", value: user?.fakultas },
                                    { label: "Jurusan", value: user?.jurusan },
                                ].map((field, i) => (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <Typography>{field.label}</Typography>
                                        <TextField
                                            fullWidth
                                            value={field.value || ""}
                                            disabled
                                            variant="outlined"
                                            InputProps={{ sx: { borderRadius: "12px", width: 350 } }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
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

export default Profile;
