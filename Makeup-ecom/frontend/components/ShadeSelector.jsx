import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ShadeSelector = ({ shades, selectedShade, onSelect }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color: '#8b008b' }}>
        Select Shade:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {shades.map((shade, index) => (
          <motion.div
            key={shade.name}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Box
              onClick={() => onSelect(shade)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: shade.hexCode,
                border: selectedShade?.name === shade.name 
                  ? '3px solid #ff69b4' 
                  : '2px solid #ddd',
                cursor: 'pointer',
                position: 'relative',
                '&:hover::after': {
                  content: `"${shade.name}"`,
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                },
              }}
            />
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default ShadeSelector;