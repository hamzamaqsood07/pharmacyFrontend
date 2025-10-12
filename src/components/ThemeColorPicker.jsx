import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { Palette, Save, Refresh } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const ThemeColorPicker = () => {
  const { themeColors, updateThemeColors } = useTheme();
  const [localColors, setLocalColors] = useState(themeColors);
  const [saving, setSaving] = useState(false);

  const handleColorChange = (colorType, color) => {
    setLocalColors(prev => ({
      ...prev,
      [colorType]: color
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateThemeColors(localColors);
      if (success) {
        toast.success('Theme colors updated successfully!');
      } else {
        toast.error('Failed to update theme colors');
      }
    } catch {
      toast.error('Error updating theme colors');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalColors(themeColors);
  };

  const colorPresets = [
    {
      name: 'Default Blue',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
    },
    {
      name: 'Pharmacy Green',
      primaryColor: '#2e7d32',
      secondaryColor: '#ff6f00',
    },
    {
      name: 'Medical Red',
      primaryColor: '#d32f2f',
      secondaryColor: '#1976d2',
    },
    {
      name: 'Professional Purple',
      primaryColor: '#7b1fa2',
      secondaryColor: '#f57c00',
    },
    {
      name: 'Modern Teal',
      primaryColor: '#00695c',
      secondaryColor: '#ff8f00',
    },
    {
      name: 'Warm Orange',
      primaryColor: '#f57c00',
      secondaryColor: '#1976d2',
    }
  ];

  const applyPreset = (preset) => {
    setLocalColors({
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Palette sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Theme Colors</Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Customize your application's color scheme. Changes will be applied across the entire application including buttons, sidebar, topbar, and backgrounds.
      </Alert>

      {/* Color Presets */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Color Presets
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {colorPresets.map((preset, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: '2px solid transparent',
                '&:hover': {
                  border: '2px solid',
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => applyPreset(preset)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: preset.primaryColor,
                      borderRadius: '50%',
                      mr: 1
                    }}
                  />
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: preset.secondaryColor,
                      borderRadius: '50%',
                      mr: 1
                    }}
                  />
                  
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {preset.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Custom Color Picker */}
      <Typography variant="subtitle1" gutterBottom>
        Custom Colors
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Primary Color
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <input
                type="color"
                value={localColors.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                style={{
                  width: 60,
                  height: 40,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              />
              <Typography variant="body2" fontFamily="monospace">
                {localColors.primaryColor}
              </Typography>
            </Box>
            <Chip 
              label="Primary" 
              size="small" 
              sx={{ 
                mt: 1,
                backgroundColor: localColors.primaryColor,
                color: 'white',
                '& .MuiChip-label': { color: 'white' }
              }} 
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Secondary Color
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <input
                type="color"
                value={localColors.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                style={{
                  width: 60,
                  height: 40,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              />
              <Typography variant="body2" fontFamily="monospace">
                {localColors.secondaryColor}
              </Typography>
            </Box>
            <Chip 
              label="Secondary" 
              size="small" 
              sx={{ 
                mt: 1,
                backgroundColor: localColors.secondaryColor,
                color: 'white',
                '& .MuiChip-label': { color: 'white' }
              }} 
            />
          </Box>
        </Grid>

      </Grid>

      {/* Preview */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 2,
        border: `2px solid ${localColors.primaryColor}30`
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: localColors.primaryColor }}>
          Preview
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Button 
            variant="contained" 
            sx={{ backgroundColor: localColors.primaryColor }}
          >
            Primary Button
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
          >
            Secondary Button
          </Button>
         
        </Box>
        
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Chip 
            label="Primary Chip" 
            color="primary"
            sx={{ backgroundColor: localColors.primaryColor }}
          />
          <Chip 
            label="Secondary Chip" 
            color="secondary"
          />
         
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Alert severity="success" sx={{ flex: 1, minWidth: 200 }}>
            Success Alert
          </Alert>
          <Alert severity="info" sx={{ flex: 1, minWidth: 200 }}>
            Info Alert
          </Alert>
          <Alert severity="warning" sx={{ flex: 1, minWidth: 200 }}>
            Warning Alert
          </Alert>
          <Alert severity="error" sx={{ flex: 1, minWidth: 200 }}>
            Error Alert
          </Alert>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" gap={2} mt={4}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{ backgroundColor: localColors.primaryColor }}
        >
          {saving ? 'Saving...' : 'Save Theme'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleReset}
          disabled={saving}
        >
          Reset
        </Button>
      </Box>
    </Paper>
  );
};

export default ThemeColorPicker;
