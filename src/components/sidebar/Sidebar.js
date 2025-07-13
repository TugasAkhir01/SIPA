import React from "react";
import {
    Box,
    Avatar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import TableChartIcon from "@mui/icons-material/TableChart";
import FactCheckIcon from '@mui/icons-material/FactCheck';
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({
    user = {
        name: "Nama Pengguna",
        nip: "123123123",
        photo: "",
    },
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("Token:", token);

    const roleMap = {
        "super admin": 0,
        "admin": 1,
        "staff": 2,
        "user": 3,
    };

    const storedUser = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );

    const rawRole = storedUser?.role ?? "user";

    const role = typeof rawRole === "string"
        ? roleMap[rawRole.toLowerCase()] ?? 3
        : Number(rawRole);

    const menuItems = [
        { text: "Beranda", icon: <HomeIcon />, path: "/home", minRole: 3 },
        { text: "Data Management", icon: <TableChartIcon />, path: "/data-management", minRole: 2 },
        { text: "User Management", icon: <GroupIcon />, path: "/user-management", minRole: 1 },
        { text: "Approval", icon: <FactCheckIcon />, path: "/approval", minRole: 1 }
    ];

    const visibleMenus = menuItems.filter(item => role <= item.minRole);

    return (
        <Box
            width={270}
            height="100%"
            bgcolor="#fff"
            p={2}
            sx={{
                boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    py: 2,
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.25)",
                }}
            >
                <Box
                    component="img"
                    src="/assets/telkom-logo.png"
                    alt="Telkom Logo"
                    sx={{ width: 110, mb: 1 }}
                />
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ textAlign: "center" }}
                >
                    SiPPAK
                </Typography>
            </Paper>

            <Divider sx={{ width: "100%", my: 1, backgroundColor: "black" }} />

            <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                mt={2}
                mb={2}
                gap={2}
            >
                <Avatar
                    src={user.photo}
                    alt={user.name}
                    sx={{ width: 60, height: 60 }}
                />
                <Box>
                    <Typography fontWeight="bold">{user.name}</Typography>
                    <Typography fontWeight="bold" color="text.secondary">
                        NIP : {user.nip}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ width: "100%", my: 1, backgroundColor: "black" }} />

            <List sx={{ width: "100%", mt: 2 }}>
                {visibleMenus.map((item) => {
                    const isSelected = location.pathname === item.path;

                    return (
                        <ListItem
                            key={item.path}
                            button
                            selected={isSelected}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: "12px",
                                mb: 1.5,
                                px: 2,
                                py: 1.5,
                                bgcolor: isSelected ? "#CED4DA !important" : "transparent",
                                "&.Mui-selected:hover": {
                                    bgcolor: "#CED4DA !important",
                                },
                                "&:hover": {
                                    bgcolor: "#CED4DA",
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: "#333" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                    color: "#333",
                                }}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default Sidebar;
