import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Favorite,
  Person,
  Palette,
} from '@mui/icons-material';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const categories = ['Lipstick', 'Foundation', 'Eyeshadow', 'Mascara', 'Blush', 'Skincare'];

  return (
    <>
      <AppBar position="sticky" sx={{ background: 'linear-gradient(45deg, #ff69b4, #9370db)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Palette sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontFamily: '"Comic Sans MS", cursive',
            }}
          >
            GlamHub 💄
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {categories.map((cat) => (
              <Typography
                key={cat}
                component={Link}
                to={`/products?category=${cat.toLowerCase()}`}
                sx={{
                  textDecoration: 'none',
                  color: 'white',
                  '&:hover': { color: '#ffd700' },
                }}
              >
                {cat}
              </Typography>
            ))}
          </Box>
          
          <IconButton color="inherit" component={Link} to="/wishlist">
            <Favorite />
          </IconButton>
          
          <IconButton color="inherit" component={Link} to="/cart">
            <Badge badgeContent={3} color="secondary">
              <ShoppingCart />
            </Badge>
          </IconButton>
          
          <IconButton color="inherit" component={Link} to="/login">
            <Person />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 2, background: '#fff0f5', height: '100%' }}>
          <Typography variant="h6" sx={{ p: 2, color: '#ff69b4', fontFamily: '"Comic Sans MS", cursive' }}>
            💋 GlamHub
          </Typography>
          <List>
            {categories.map((cat) => (
              <ListItem
                button
                key={cat}
                component={Link}
                to={`/products?category=${cat.toLowerCase()}`}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={cat} sx={{ color: '#9370db' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;