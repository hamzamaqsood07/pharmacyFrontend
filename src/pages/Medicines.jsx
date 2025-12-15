import { useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Search,
  MoreVert,
  LocalPharmacy,
  Inventory,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../utils/axiosConfig";

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    salesPrice: "",
    purchasePrice: "",
    packSize: "",
    qty: "",
  });

  const searchRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get("/medicine");
      setMedicines(response.data);
    } catch (error) {
      toast.error("Failed to fetch medicines");
    }
  };

  const handleOpenDialog = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        salesPrice: medicine.salesPrice.toString(),
        purchasePrice: medicine.purchasePrice.toString(),
        packSize: medicine.packSize.toString(),
        qty: medicine.qty.toString(),
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: "",
        salesPrice: "",
        purchasePrice: "",
        packSize: "",
        qty: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMedicine(null);
    setFormData({
      name: "",
      salesPrice: "",
      purchasePrice: "",
      packSize: "",
      qty: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.salesPrice ||
      !formData.purchasePrice ||
      !formData.packSize 
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const data = {
        name: formData.name,
        salesPrice: parseFloat(formData.salesPrice),
        purchasePrice: parseFloat(formData.purchasePrice),
        packSize: parseInt(formData.packSize),
      };

      if (editingMedicine) {
        await api.put(`/medicine/${editingMedicine.id}`, data);
        toast.success("Medicine updated successfully");
      } else {
        const response = await api.post("/medicine", data);
        const {message} = await response.data
        toast.success(message);
      }

      handleCloseDialog();
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, medicine) => {
    setAnchorEl(event.currentTarget);
    setSelectedMedicine(medicine);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMedicine(null);
  };

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: "Out of Stock", color: "error" };
    if (qty < 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter((m) => m.qty < 10).length;
  const outOfStockMedicines = medicines.filter((m) => m.qty === 0).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medicine Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalPharmacy color="primary" sx={{ mr: 2 }} />
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
                <Inventory color="warning" sx={{ mr: 2 }} />
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

      {/* Search and Add Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Medicines</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Medicine
          </Button>
        </Box>

        <TextField
          label="Search Medicines"
          value={searchTerm}
          inputRef={searchRef}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Sales Price</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Pack Size</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.qty);
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {medicine.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {medicine.salesPrice}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {medicine.purchasePrice}
                      </Box>
                    </TableCell>
                    <TableCell>{medicine.packSize}</TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {medicine.qty}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.label}
                        color={stockStatus.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, medicine)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredMedicines.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm
                ? "No medicines found matching your search"
                : "No medicines available"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenDialog(selectedMedicine);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
      </Menu>

      {/* Add/Edit Medicine Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Medicine Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sales Price"
                  type="number"
                  value={formData.salesPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, salesPrice: e.target.value })
                  }
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      inputProps: { min: 0, step: 0.01 },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      inputProps: { min: 0, step: 0.01 },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pack Size"
                  type="number"
                  value={formData.packSize}
                  onChange={(e) =>
                    setFormData({ ...formData, packSize: e.target.value })
                  }
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      inputProps: { min: 1 },
                    },
                  }}
                />
              </Grid>

            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingMedicine ? "Update" : "Add"} Medicine
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Medicines;
