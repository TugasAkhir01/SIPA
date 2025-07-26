// profile.js (versi update dengan photo path fix, cache busting, dan response photo update)
import React, { useState } from "react";
import {
    Box, Typography, AppBar, Toolbar, IconButton, TextField,
    Grid, Paper, MenuItem, Button, Avatar, Menu, Dialog,
    DialogTitle, DialogContent, DialogActions, ListItemIcon
} from "@mui/material";
import {
    Logout, Menu as MenuIcon, Edit as EditIcon, CameraAlt as CameraAltIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Sidebar from "../sidebar/Sidebar";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import { Slider } from "@mui/material";
import axios from "axios";

// import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Profile = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [fetchedUser, setFetchedUser] = React.useState(null);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editData, setEditData] = React.useState({});
    const [previewUrl, setPreviewUrl] = React.useState(null);
    const [photoTimestamp, setPhotoTimestamp] = React.useState(Date.now());
    const [successOpen, setSuccessOpen] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [rawImage, setRawImage] = useState(null);
    const [errors, setErrors] = useState({});

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

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    React.useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

        axios.get(`http://sippak-be.up.railway.app/api/users/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setFetchedUser(res.data);
        }).catch((err) => {
            console.error("Gagal mengambil data user:", err);
        });
    }, [user, navigate, token]);

    const finalUser = React.useMemo(() => ({
        ...user,
        ...(fetchedUser || {}),
    }), [user, fetchedUser]);

    const handleUpdateProfile = () => {
        const requiredFields = ["nama", "nip", "email", "no_telp", "fakultas", "jurusan"];
        const newErrors = {};

        requiredFields.forEach(field => {
            if (!editData[field] || editData[field].trim() === "") {
                newErrors[field] = `${fieldLabels[field]} tidak boleh kosong`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        axios.put(`http://sippak-be.up.railway.app/api/users/profile/${finalUser.id}`, editData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(() => {
            setFetchedUser({ ...fetchedUser, ...editData });
            setEditOpen(false);
            setSuccessOpen(true);
        }).catch(err => {
            console.error("Gagal update profil:", err);
        });
    };

    const userName = finalUser?.nama || "User";
    const userPhoto = finalUser?.photo
        ? `http://sippak-be.up.railway.app/uploads/profile/${finalUser.photo}?v=${photoTimestamp}`
        : "/default-avatar.png";

    const fieldLabels = {
        nama: "Nama",
        nip: "NIP",
        email: "Email",
        no_telp: "Nomor Telp.",
        fakultas: "Fakultas",
        jurusan: "Prodi"
    };

    const capitalizeWords = (str) =>
        str.replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <Box display="flex" flexDirection="column" sx={{ height: '100vh' }}>
            {console.log("finalUser.photo", finalUser?.photo)}
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
                        <Box onClick={handleClick} sx={{ display: "flex", alignItems: "center", cursor: "pointer", px: 1, py: 0.5, borderRadius: 1, "&:hover": { backgroundColor: theme.palette.action.hover } }}>
                            <Avatar alt={userName} src={userPhoto} sx={{ width: 36, height: 36, mr: 1 }} />
                            <Typography variant="h6" fontWeight="bold" fontSize={16} sx={{ color: "#fff" }}>{userName}</Typography>
                        </Box>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={() => setLogoutDialogOpen(true)}>
                                <ListItemIcon><Logout fontSize="small" /></ListItemIcon> Sign out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flex: 1, minHeight: 0, height: 'calc(100vh - 64px)' }} bgcolor="#F8F9FA">
                {sidebarOpen && <Sidebar user={{ name: userName, nip: finalUser?.nip || "-", photo: userPhoto }} />}
                <Box flexGrow={1} bgcolor="#f5f5f5" p={3} sx={{ overflowY: "scroll", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={3} maxWidth={800} mx="auto" mt={4}>
                            <Box position="relative">
                                <Avatar
                                    src={previewUrl || userPhoto}
                                    alt={userName}
                                    sx={{ width: 150, height: 150 }}
                                />
                                <IconButton component="label" size="small" sx={{ position: "absolute", bottom: 0, left: "calc(46% - 16px)" }}>
                                    <CameraAltIcon fontSize="large" sx={{ color: "#fff" }} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            if (file.size > 2 * 1024 * 1024) {
                                                alert("Ukuran gambar maksimal 2MB");
                                                return;
                                            }

                                            const imageUrl = URL.createObjectURL(file);
                                            setRawImage(imageUrl);
                                            setCropModalOpen(true);
                                        }}
                                    />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="h6">{userName}</Typography>
                                <Typography variant="body2" color="text.secondary">NIP: {finalUser?.nip || "-"}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Role: {finalUser?.role ? capitalizeWords(finalUser.role) : "-"}
                                </Typography>
                            </Box>
                            <Box ml="auto" mr={6}>
                                <IconButton color="primary" onClick={() => {
                                    setEditData(finalUser);
                                    setEditOpen(true);
                                }}
                                    sx={{ color: "#000" }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Box mt={5} maxWidth={800} mx="auto" mb={5}>
                            <Typography variant="h6" gutterBottom>Contact Information</Typography>
                            <Grid container spacing={6} sx={{ mt: 2 }}>
                                {Object.keys(fieldLabels).map((field, i) => (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <Typography fontWeight="600">{fieldLabels[field]}</Typography>
                                        <TextField
                                            fullWidth
                                            value={finalUser[field] || ""}
                                            disabled
                                            variant="outlined"
                                            InputProps={{
                                                sx: { borderRadius: "12px", width: 350, mt: 1 }
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Edit Profile</DialogTitle>
                <DialogContent dividers>
                    {["nama", "nip", "email", "no_telp", "fakultas", "jurusan"].map((field, i) => (
                        <Box key={i} mb={2}>
                            <Typography variant="body2" fontWeight="regular" mb={1}>
                                {fieldLabels[field]}
                            </Typography>
                            {field === "jurusan" ? (
                                <TextField
                                    select
                                    fullWidth
                                    variant="outlined"
                                    value={editData[field] || ""}
                                    error={!!errors[field]}
                                    helperText={errors[field] || ""}
                                    onChange={(e) =>
                                        setEditData({ ...editData, [field]: e.target.value })
                                    }
                                >
                                    {["Informatika", "Rekayasa Perangkat Lunak", "Teknologi Informasi", "Data Sains"].map((option, idx) => (
                                        <MenuItem key={idx} value={option}>{option}</MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder={fieldLabels[field]}
                                    value={editData[field] || ""}
                                    error={!!errors[field]}
                                    helperText={errors[field] || ""}
                                    onChange={(e) =>
                                        setEditData({ ...editData, [field]: e.target.value })
                                    }
                                />
                            )}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setEditOpen(false)}
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
                        onClick={handleUpdateProfile}
                        variant="contained"
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
                        }}>
                        Simpan
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '10px' } }}>
                <DialogContent sx={{ textAlign: "center", py: 2.5, }}>
                    {/* <CheckCircleIcon sx={{ fontSize: 130, color: "green", mb: 0.5 }} /> */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
                        Edit Success!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Update Profile Data Successfully!
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setSuccessOpen(false)}
                        sx={{
                            mt: 2.5,
                            backgroundColor: "#1F1F1F",
                            color: "#fff",
                            textTransform: "none",
                            px: 3,
                            py: 1,
                            borderRadius: "10px",
                            float: "right",
                            "&:hover": {
                                backgroundColor: "#333333",
                            },
                        }}
                    >
                        OK
                    </Button>
                </DialogContent>
            </Dialog>
            <Dialog open={cropModalOpen} onClose={() => setCropModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Atur Foto Profil</DialogTitle>
                <DialogContent sx={{ position: "relative", width: "100%", height: 600, bgcolor: "#333" }}>
                    <Cropper
                        image={rawImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, cropped) => setCroppedAreaPixels(cropped)}
                    />
                    <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e, z) => setZoom(z)}
                        sx={{ my: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setCropModalOpen(false)}
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
                        }}>
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            const croppedImage = await getCroppedImg(rawImage, croppedAreaPixels);
                            const blob = await fetch(croppedImage).then((r) => r.blob());
                            const formData = new FormData();
                            formData.append("photo", blob, "cropped.jpg");

                            axios.put(`http://sippak-be.up.railway.app/api/users/profile/${finalUser.id}/photo?type=photo`, formData, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "multipart/form-data"
                                }
                            }).then((res) => {
                                const updatedPhoto = res.data.updatedPhoto;
                                setFetchedUser({ ...fetchedUser, photo: updatedPhoto });
                                setPhotoTimestamp(Date.now());
                                sessionStorage.setItem("user", JSON.stringify({ ...finalUser, photo: updatedPhoto }));
                                setPreviewUrl(croppedImage);
                                setCropModalOpen(false);
                            });
                        }}
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
                        Simpan
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
                <DialogTitle>
                    <Box sx={{ mb: 1, mt: 2 }}><Logout sx={{ color: "error.main", fontSize: "60px" }} /></Box>
                    <Typography variant="h6" component="span" fontWeight="bold">Konfirmasi Logout</Typography>
                </DialogTitle>
                <DialogContent>
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

export default Profile;
