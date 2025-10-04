import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider
} from '@mui/material';
import {
  Add,
  Remove,
  Search,
  ShoppingCart,
  Inventory,
  TrendingUp,
  AttachMoney
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../utils/axiosConfig';

const Purchase = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [packQuantity, setPackQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicine');
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    }
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setPackQuantity(1);
    setSearchTerm('');
    setFilteredMedicines([]);
  };

  const handlePurchase = async () => {
    if (!selectedMedicine || packQuantity <= 0) {
      toast.error('Please select a medicine and enter valid quantity');
      return;
    }

    const totalQuantity = selectedMedicine.packSize * packQuantity;
    const newStock = selectedMedicine.qty + totalQuantity;

    setPurchaseData({
      medicine: selectedMedicine,
      packQuantity,
      totalQuantity,
      newStock
    });
    setConfirmDialogOpen(true);
  };

  const confirmPurchase = async () => {
    try {
      setLoading(true);
      await api.patch(`/medicine/increment/${selectedMedicine.id}`, {
        packQty: packQuantity
      });

      toast.success(`Stock updated successfully! Added ${purchaseData.totalQuantity} units to ${selectedMedicine.name}`);
      
      // Reset form
      setSelectedMedicine(null);
      setPackQuantity(1);
      setConfirmDialogOpen(false);
      setPurchaseData(null);
      
      // Refresh medicines list
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'error' };
    if (qty < 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(m => m.qty < 10).length;
  const outOfStockMedicines = medicines.filter(m => m.qty === 0).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Purchase & Stock Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Inventory color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalMedicines}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Medicines
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{lowStockMedicines}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Inventory color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{outOfStockMedicines}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Stock to Medicine
        </Typography>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={12} md={10} sx={{ width: '100%' }}>
            <Autocomplete
              sx={{ width: '100%' }}
              freeSolo
              options={filteredMedicines}
              getOptionLabel={(option) => option.name || ''}
              value={selectedMedicine}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'object') {
                  handleMedicineSelect(newValue);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Medicine"
                  placeholder="Type medicine name to search..."
                  fullWidth
                  size="large"
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      minHeight: '56px',
                      '& fieldset': {
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 14px',
                    },
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: '1.2rem' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Stock: {option.qty} | Pack Size: {option.packSize}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <TextField
              label="Number of packs to add"
              type="number"
              value={packQuantity}
              onChange={(e) => setPackQuantity(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
              size="large"
              // helperText="Number of packs to add"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={handlePurchase}
              disabled={!selectedMedicine || packQuantity <= 0}
              fullWidth
              size="large"
              sx={{ height: '56px' }}
            >
              Add Stock
            </Button>
          </Grid>
        </Grid>

        {selectedMedicine && (
          <Box mt={2}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>{selectedMedicine.name}</strong> - Current Stock: {selectedMedicine.qty} units
                <br />
                Pack Size: {selectedMedicine.packSize} units per pack
                <br />
                Adding {packQuantity} pack(s) = {selectedMedicine.packSize * packQuantity} units
                <br />
                New Stock: {selectedMedicine.qty + (selectedMedicine.packSize * packQuantity)} units
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Current Stock Overview */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Stock Overview
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicine Name</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell>Pack Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Sales Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.qty);
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {medicine.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {medicine.qty}
                      </Typography>
                    </TableCell>
                    <TableCell>{medicine.packSize}</TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AttachMoney fontSize="small" />
                        {medicine.purchasePrice}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AttachMoney fontSize="small" />
                        {medicine.salesPrice}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {medicines.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No medicines available
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Stock Purchase</DialogTitle>
        <DialogContent>
          {purchaseData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {purchaseData.medicine.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Stock:
                  </Typography>
                  <Typography variant="h6">
                    {purchaseData.medicine.qty} units
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Pack Size:
                  </Typography>
                  <Typography variant="h6">
                    {purchaseData.medicine.packSize} units
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Adding Packs:
                  </Typography>
                  <Typography variant="h6">
                    {purchaseData.packQuantity} packs
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Units:
                  </Typography>
                  <Typography variant="h6">
                    {purchaseData.totalQuantity} units
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    New Stock After Purchase:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {purchaseData.newStock} units
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmPurchase}
            variant="contained"
            disabled={loading}
            startIcon={<ShoppingCart />}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Purchase;
