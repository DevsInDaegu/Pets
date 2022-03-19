import * as React from 'react';
import { AppBar, MenuItem, Box, Toolbar, Typography, IconButton } from '@mui/material';
import { Link, useLocation } from "react-router-dom";
import logo from '../Resources/logo.svg';

export default function Navbar() {
  const links = [
    // {
    //   label: "홈",
    //   path: "/home"
    // },
    {
      label: "지도 검색",
      path: "/searchmap"
    }
  ]
  const location = useLocation()

  return (
    <Box sx={{ flexGrow: 1 }}
    style={{
      marginBottom: "1rem"
    }}>
      <AppBar position="static">
        <Toolbar style={{
          paddingLeft: "1rem"
        }}>
           <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            component={Link}
            to={"/"}
          >
            <div style={{
              width: "3rem",
              height: "3rem",
              objectFit: "fill",
              backgroundColor: "white",
              WebkitMask: `url(${logo})`,
              mask: `url(${logo})`
            }}></div>
          </IconButton>
          {
            links.map(link => 
                <MenuItem
                component={Link}
                to={link.path}
                key={link.label}
                style={{
                  marginLeft: "1rem"
                }}
                 >
                <Typography textAlign="center"
                  color={location.pathname === link.path ? "white" : "textPrimary"}>
                  {link.label}</Typography>
              </MenuItem>
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}