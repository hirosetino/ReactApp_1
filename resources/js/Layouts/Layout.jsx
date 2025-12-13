import { useState } from "react";
import { router } from "@inertiajs/react";

import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    CssBaseline,
    Box,
    useMediaQuery,
    Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 160;

const menuItems = [
    { label: "カレンダー", route: "/calendar" },
    { label: "レシピ一覧", route: "/recipe" },
];

export default function Layout({
    isSearch = false,
    rightContent = false,
    children,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    const toggleDrawer = () => {
        setMobileOpen(!mobileOpen);
    };

    const logout = () => router.post("/logout");

    const drawerContent = (
        <div className="mt-16">
            <Toolbar>
                <Typography>メニュー</Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                <ListItemButton key={item.label} onClick={() => router.visit(item.route)}>
                    <ListItemText primary={item.label} />
                </ListItemButton>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "#ffffff",
                color: "#000000"
                }}
            >
                <Toolbar>

                {!isDesktop && (
                    <IconButton
                    color="inherit"
                    edge="start"
                    onClick={toggleDrawer}
                    sx={{ mr: 1 }}
                    >
                    <MenuIcon />
                    </IconButton>
                )}

                <Typography
                    variant="h6"
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 'bold',
                    }}
                >
                    <img
                        src="/images/logo_circle.png"
                        alt=""
                        style={{ width: 32, height: 32 }}
                    />
                    cooking pad
                </Typography>

                <IconButton color="inherit" onClick={logout}>
                    <LogoutIcon />
                </IconButton>
                </Toolbar>
            </AppBar>

            {isDesktop && (
                <Drawer
                variant="permanent"
                open
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    },
                }}
                >
                {drawerContent}
                </Drawer>
            )}

            {!isDesktop && (
                <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={toggleDrawer}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    "& .MuiDrawer-paper": { width: drawerWidth },
                }}
                >
                {drawerContent}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    mt: "64px",
                    p: 2,
                }}
            >
                {children}
            </Box>

            {isDesktop && isSearch && (
                <Box>
                    {rightContent}
                </Box>
            )}
        </Box>
    );
}
