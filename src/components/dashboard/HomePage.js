import React from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, InputBase, Paper,
    Select, MenuItem, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Avatar, Menu, Dialog, DialogTitle,
    DialogContent, DialogActions, ListItemIcon,
} from "@mui/material";
import { Person, Logout, Menu as MenuIcon } from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from '../sidebar/Sidebar';
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user"));

    const userName = user?.nama || "User";

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleSignOut = () => {
        if (sessionStorage.getItem("user")) {
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
        }
        navigate("/");
    };    

    return (
        <Box>
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <MenuIcon />
                        </IconButton>
                        <IconButton>
                            <img src="/logo192.png" alt="Logo" width={30} />
                        </IconButton>
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            Website Pendataan Pelanggaran Akademik
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box
                            onClick={handleClick}
                            sx={{
                                display: "flex", alignItems: "center", cursor: "pointer", px: 1, py: 0.5,
                                borderRadius: 1, "&:hover": { backgroundColor: "action.hover" },
                            }}
                        >
                            <Avatar
                                alt={userName}
                                src={user?.foto || "/default-avatar.png"}
                                sx={{ width: 36, height: 36, mr: 1 }}
                            />
                            <Typography variant="h6" fontSize={16}>
                                {userName}
                            </Typography>
                        </Box>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={handleClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            <Box display="flex" height="100vh">
                {sidebarOpen && (
                    <Sidebar user={{
                        name: user?.nama || "User",
                        nip: user?.nip || "-",
                        role: user?.role || "-",
                        profile: user?.foto || "/default-avatar.png"
                    }} />
                )}
                <Box flex={1} p={3}>
                    <Typography variant="h6" fontWeight="bold">
                        Selamat datang, {userName}!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Lorem ipsum sit amet consectetur elit
                    </Typography>
                    <Box display="flex" alignItems="center" mt={3} gap={2}>
                        <Paper sx={{ display: "flex", alignItems: "center", p: "2px 8px", width: 240 }} variant="outlined">
                            <SearchIcon sx={{ mr: 1 }} />
                            <InputBase placeholder="Lorem ..." fullWidth />
                        </Paper>
                        <Select size="small" defaultValue="Lorem">
                            <MenuItem value="Lorem">Lorem</MenuItem>
                            <MenuItem value="Ipsum">Ipsum</MenuItem>
                        </Select>
                    </Box>
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {["No.", "Nama", "NIM", "Jurusan", "ID Kasus", "Jenis Kasus", "Status", "Hasil Sidang", "Notulensi"]
                                        .map((head, i) => (
                                            <TableCell key={i}>{head}</TableCell>
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
                                            <Button size="small" variant="outlined">Lorem</Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained">View</Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
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
