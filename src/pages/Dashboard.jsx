import React, { useState, useEffect, useRef } from "react";
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
  Autocomplete,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  Search,
  Receipt,
  AttachMoney,
  Percent,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../utils/axiosConfig";

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);// Ref for the search input field
  const quantityRef = useRef(null);// Ref for the quantity input field
  const discountRef = useRef(null);// Ref for the discount in dialog box
  const cashPaidRef = useRef(null);// Ref for the cash paid in dialog box

  useEffect(() => {
    if (finalizeDialogOpen) {
    setTimeout(() => {
      if (discountRef.current) {
        discountRef.current.focus();
        discountRef.current.select();
      }
      
    }, 100);
  }
  }, [finalizeDialogOpen])
  

  useEffect(() => {
    fetchMedicines();
    fetchCurrentInvoice();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
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

  const fetchCurrentInvoice = async () => {
    try {
      const response = await api.get("/invoice/currentInvoice");
      setCurrentInvoice(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch current invoice");
      }
    }
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    setQuantity(1);
    setSearchTerm("");
    setFilteredMedicines([]);

    setTimeout(() => {
      quantityRef.current?.focus();
      quantityRef.current?.select();
    }, 100);
  };

  const handleAddToInvoice = async () => {
    if (!selectedMedicine || quantity <= 0) return;

    try {
      setLoading(true);
      await api.post("/invoice/add-item", {
        medicineId: selectedMedicine.id,
        qty: quantity,
      });

      toast.success("Medicine added to invoice");
      setSelectedMedicine(null);
      setQuantity(1);
      setSearchTerm("");
      setFilteredMedicines([]);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      fetchCurrentInvoice();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add medicine to invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromInvoice = async (medicineId) => {
    try {
      await api.delete(`/invoice/remove-item/${medicineId}`);
      toast.success("Medicine removed from invoice");
      fetchCurrentInvoice();
    } catch (error) {
      toast.error("Failed to remove medicine from invoice");
    }
  };

  const handleUpdateQuantity = async (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromInvoice(medicineId);
      return;
    }

    try {
      await api.patch("/invoice/update-item", {
        medicineId,
        qty: newQuantity,
      });
      fetchCurrentInvoice();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleFinalizeInvoice = async () => {
    if (cashPaid < currentInvoice.netTotal) {
      toast.error("Cash paid must be at least equal to net total");
      return;
    }

    try {
      setLoading(true);
      await api.post("/invoice/finalize", {
        cashPaid,
        discountedPercentage: discountPercentage,
      });

      toast.success("Invoice finalized successfully");
      setFinalizeDialogOpen(false);
      setCurrentInvoice(null);
      setDiscountPercentage(0);
      setCashPaid(0);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to finalize invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardInvoice = async () => {
    try {
      await api.delete("/invoice/currentInvoice");
      toast.success("Invoice discarded");
      setCurrentInvoice(null);
    } catch (error) {
      toast.error("Failed to discard invoice");
    }
  };

  const calculateTotals = () => {
    if (!currentInvoice) return { grossTotal: 0, discount: 0, netTotal: 0 };

    const grossTotal = currentInvoice.grossTotal || 0;
    const discount = (grossTotal * discountPercentage) / 100;
    const netTotal = grossTotal - discount;

    return { grossTotal, discount, netTotal };
  };

  const { grossTotal, discount, netTotal } = calculateTotals();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Focus search input with Ctrl+F
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Open finalize dialog with Ctrl+Enter when invoice exists
      if (e.ctrlKey && e.key === "Enter" && currentInvoice) {
        setFinalizeDialogOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentInvoice]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h4">Invoice Dashboard</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: { xs: "none", sm: "block" },
            fontSize: "0.875rem",
          }}
        >
          Keyboard shortcuts: Ctrl+F (search), Enter (add), Ctrl+Enter
          (finalize)
        </Typography>
      </Box>

      {/* Medicine Search and Add Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Medicine to Invoice
        </Typography>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={12} md={10} sx={{ width: "100%" }}>
            <Autocomplete
              sx={{ width: "100%" }}
              freeSolo
              options={filteredMedicines}
              getOptionLabel={(option) => option.name || ""}
              value={selectedMedicine || ""}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === "object") {
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
                  inputRef={searchInputRef}
                  fullWidth
                  size="large"
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      fontSize: "1.1rem",
                      minHeight: "56px",
                      "& fieldset": {
                        borderWidth: "2px",
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                      "&.Mui-focused fieldset": {
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "16px 14px",
                    },
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: "1.2rem" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {option.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {option.qty} Units | Unit Price: Rs.{" "}
                      {(option.salesPrice / option.packSize).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              inputProps={{ min: 1 }}
              fullWidth
              size="large"
              inputRef={quantityRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedMedicine && quantity > 0) {
                  handleAddToInvoice();
                }
              }}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddToInvoice}
              disabled={!selectedMedicine || quantity <= 0 || loading}
              fullWidth
              size="large"
              sx={{ height: "56px" }}
            >
              Add to Invoice
            </Button>
          </Grid>
        </Grid>

        {selectedMedicine && (
          <Box mt={2}>
            <Chip
              label={`${selectedMedicine.name} - Stock: ${
                selectedMedicine.qty
              } Units - Unit Price: Rs. ${(
                selectedMedicine.salesPrice / selectedMedicine.packSize
              ).toFixed(2)}`}
              onDelete={() => setSelectedMedicine(null)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Current Invoice */}
      {currentInvoice && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Current Invoice</Typography>
            <Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDiscardInvoice}
                sx={{ mr: 1 }}
              >
                Discard
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setFinalizeDialogOpen(true)}
                startIcon={<Receipt />}
              >
                Finalize Invoice
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentInvoice.invoiceMedicines?.map((item) => (
                  <TableRow key={item.medicineId}>
                    <TableCell>{item.medicine?.name}</TableCell>
                    <TableCell> {item.salesPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleUpdateQuantity(item.medicineId, item.qty - 1)
                          }
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.qty}</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleUpdateQuantity(item.medicineId, item.qty + 1)
                          }
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {(item.salesPrice * item.qty).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFromInvoice(item.medicineId)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Invoice Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Gross Total:</Typography>
                    <Typography>{grossTotal?.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Discount ({discountPercentage}%):</Typography>
                    <Typography>-{discount?.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Net Total:</Typography>
                    <Typography variant="h6">{netTotal?.toFixed(2)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Finalize Invoice Dialog */}
      <Dialog
        open={finalizeDialogOpen}
        onClose={() => setFinalizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Finalize Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Discount Percentage"
              type="number"
              value={discountPercentage}
              onChange={(e) =>
                setDiscountPercentage(parseFloat(e.target.value))
              }
              inputRef={discountRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Percent />
                  </InputAdornment>
                ),
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Cash Paid"
              type="number"
              value={cashPaid}
              onChange={(e) => setCashPaid(parseFloat(e.target.value))}
              inputRef={cashPaidRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rs. </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Net Total: Rs. {netTotal.toFixed(2)}
            </Typography>
            {cashPaid > 0 && (
              <Typography
                variant="body2"
                color={cashPaid >= netTotal ? "success.main" : "error.main"}
              >
                Change: Rs. {(cashPaid - netTotal).toFixed(2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFinalizeInvoice}
            variant="contained"
            disabled={loading || cashPaid < netTotal}
          >
            Finalize Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
