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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ user = { name: "Username", nip: "123123123", photo: "", role: "Role" } }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: "Homepage", icon: <HomeIcon />, path: "/home" },
        { text: "User Management", icon: <GroupIcon />, path: "/users" },
        { text: "Data Management", icon: <TableChartIcon />, path: "/data" },
        { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
    ];

    return (
        <Box
            width={240}
            height="100vh"
            bgcolor="#f9f9f9"
            p={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            borderRight="1px solid #ccc"
        >
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                    src={user.photo}
                    alt={user.name}
                    sx={{ width: 100, height: 100, mb: 1 }}
                />
                <Typography variant="h6">{user.name}</Typography>
            </Box>
            <Divider sx={{ width: "100%", mb: 2 }} />
            <Typography variant="body1" gutterBottom>
                {user.role}
            </Typography>
            <Typography variant="body2" color="textSecondary">
                NIP : {user.nip}
            </Typography>
            <Divider sx={{ width: "100%", my: 2 }} />
            <List sx={{ width: "100%" }}>
                {menuItems.map((item, index) => (
                    <ListItem
                        button
                        key={index}
                        selected={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;
