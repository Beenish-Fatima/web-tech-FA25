import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
} from '@mui/material';
import {
  FavoriteBorder,
  ShoppingCart,
  Star,
  Sparkles,
} from '@mui/icons-material';
import api from '../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?featured=true');
      setFeaturedProducts(response.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ffb6c1 0%, #d8bfd8 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 8 },
          my: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles sx={{ fontSize: 60, color: '#ff69b4', mb: 2 }} />
          <Typography
            variant="h2"
            sx={{
              color: '#8b008b',
              fontFamily: '"Comic Sans MS", cursive',
              mb: 2,
            }}
          >
            Unleash Your Inner Glam! ✨
          </Typography>
          <Typography variant="h5" sx={{ color: '#4b0082', mb: 4 }}>
            Discover makeup that makes you shine
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            sx={{
              background: 'linear-gradient(45deg, #ff69b4, #9370db)',
              fontSize: '1.2rem',
              px: 4,
              py: 1.5,
              borderRadius: 50,
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.3s',
              },
            }}
          >
            Shop Now 💖
          </Button>
        </motion.div>
      </Box>

      {/* Featured Products */}
      <Typography
        variant="h3"
        sx={{
          textAlign: 'center',
          my: 6,
          color: '#ff69b4',
          fontFamily: '"Comic Sans MS", cursive',
        }}
      >
        🌟 Featured Products
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {featuredProducts.map((product, index) => (
          <Grid item xs={12} sm={6} md={3} key={product._id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(255,105,180,0.2)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images?.[0] || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, bgcolor: '#fff0f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{ bgcolor: '#ff69b4', color: 'white' }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: '#ffd700', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {product.rating}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8b008b' }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    {product.description.substring(0, 60)}...
                  </Typography>
                  
                  <Typography variant="h5" sx={{ color: '#9370db', fontWeight: 'bold', my: 1 }}>
                    ${product.price}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FavoriteBorder />}
                      sx={{
                        borderColor: '#ff69b4',
                        color: '#ff69b4',
                        '&:hover': { borderColor: '#ff1493' },
                      }}
                    >
                      Wish
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCart />}
                      sx={{
                        flexGrow: 1,
                        bgcolor: '#9370db',
                        '&:hover': { bgcolor: '#7b68ee' },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Categories */}
      <Box sx={{ my: 8 }}>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            mb: 4,
            color: '#ff69b4',
            fontFamily: '"Comic Sans MS", cursive',
          }}
        >
          🎀 Shop by Category
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {['Lipstick', 'Foundation', 'Eyeshadow', 'Skincare'].map((cat, index) => (
            <Grid item xs={6} md={3} key={cat}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card
                  component={Link}
                  to={`/products?category=${cat.toLowerCase()}`}
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4,
                    bgcolor: '#fff0f5',
                    textDecoration: 'none',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: '#ffe4e9',
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#ff69b4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      {['💄', '🎨', '👁️', '✨'][index]}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ color: '#8b008b', fontWeight: 'bold' }}>
                    {cat}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;