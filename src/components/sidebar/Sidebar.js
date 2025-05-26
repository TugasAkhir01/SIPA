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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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

    const menuItems = [
        { text: "Beranda", icon: <HomeIcon />, path: "/home" },
        { text: "Data Management", icon: <TableChartIcon />, path: "/data-management" },
        { text: "User Management", icon: <GroupIcon />, path: "/user-management" },
        { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
    ];

    return (
        <Box
            width={270}
            height="93vh"
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
                    <Typography fontWeight="bold">
                        {user.name}
                    </Typography>
                    <Typography fontWeight="bold" color="text.secondary">
                        NIP : {user.nip}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ width: "100%", my: 1, backgroundColor: "black" }} />
            <List sx={{ width: "100%" }}>
                {menuItems.map((item, index) => (
                    <ListItem
                        button
                        key={index}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            bgcolor:
                                location.pathname === item.path
                                    ? "#e0e0e0"
                                    : "transparent",
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontWeight:
                                    location.pathname === item.path ? "bold" : "normal",
                                fontSize: 14,
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;
