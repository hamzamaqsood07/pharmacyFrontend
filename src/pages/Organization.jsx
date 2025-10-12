import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Business,
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Upload,
  Palette
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';
import ThemeColorPicker from '../components/ThemeColorPicker';

const Organization = () => {
  const [organization, setOrganization] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    orgTitle: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await api.get('/organization');
      setOrganization(response.data);
      setFormData({
        orgTitle: response.data.orgTitle || '',
        description: response.data.description || '',
        address: response.data.address || '',
        phone: response.data.phone || '',
        email: response.data.email || ''
      });
    } catch (error) {
      toast.error('Failed to fetch organization details');
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      orgTitle: organization.orgTitle || '',
      description: organization.description || '',
      address: organization.address || '',
      phone: organization.phone || '',
      email: organization.email || ''
    });
  };

  const handleSave = async () => {
    if (!formData.orgTitle.trim()) {
      toast.error('Organization title is required');
      return;
    }

    try {
      setLoading(true);
      await api.patch('/organization', formData);
      toast.success('Organization updated successfully');
      setEditMode(false);
      fetchOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setLogoDialogOpen(true);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', selectedFile);

      await api.post('/organization/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Logo uploaded successfully');
      setLogoDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchOrganization();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoRemove = async () => {
    try {
      await api.delete('/organization/logo');
      toast.success('Logo removed successfully');
      fetchOrganization();
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Organization Profile
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            icon={<Business />} 
            label="Organization Info" 
            iconPosition="start"
          />
          <Tab 
            icon={<Palette />} 
            label="Theme Colors" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
        {/* Organization Info Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Organization Information
              </Typography>
              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Organization Title"
                  value={formData.orgTitle}
                  onChange={(e) => setFormData({ ...formData, orgTitle: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!editMode}
                  placeholder="Brief description of your organization"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Logo Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Organization Logo
            </Typography>
            
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={organization?.logoUrl}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  border: '2px solid #e0e0e0'
                }}
              >
                <Business sx={{ fontSize: 60 }} />
              </Avatar>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="logo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  sx={{ mb: 1 }}
                >
                  Upload Logo
                </Button>
              </label>
              
              {organization?.logoUrl && (
                <Button
                  variant="text"
                  color="error"
                  onClick={handleLogoRemove}
                  size="small"
                >
                  Remove Logo
                </Button>
              )}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Upload a square logo image (recommended: 200x200px or larger)
                <br />
                Supported formats: JPG, PNG, GIF
                <br />
                Maximum file size: 5MB
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Organization Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Organization Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created Date
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {organization?.updatedAt ? new Date(organization.updatedAt).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      Active
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Chip 
                      label={organization?.logoUrl ? 'Logo Set' : 'No Logo'} 
                      color={organization?.logoUrl ? 'success' : 'default'}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Logo Status
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ThemeColorPicker />
          </Grid>
        </Grid>
      )}

      {/* Logo Preview Dialog */}
      <Dialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preview Logo</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            {previewUrl && (
              <Avatar
                src={previewUrl}
                sx={{ 
                  width: 200, 
                  height: 200, 
                  mb: 2,
                  border: '2px solid #e0e0e0'
                }}
              />
            )}
            <Typography variant="body2" color="text.secondary" textAlign="center">
              This is how your logo will appear in the application
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLogoUpload}
            disabled={loading}
            startIcon={<Upload />}
          >
            Upload Logo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Organization;
