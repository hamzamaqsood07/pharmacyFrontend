import React, { useState, useEffect, useRef, useContext } from "react";
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
  Print,
  Percent,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../utils/axiosConfig";
import { ThemeContext } from "../contexts/ThemeContext";

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
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [finalizedInvoice, setFinalizedInvoice] = useState(null);
  const [perMedicineDiscount, setPerMedicineDiscount] = useState(0);

  const { themeColors } = useContext(ThemeContext);

  const searchInputRef = useRef(null); // Ref for the search input field
  const quantityRef = useRef(null); // Ref for the quantity input field
  const discountRef = useRef(null); // Ref for the discount in dialog box
  const cashPaidRef = useRef(null); // Ref for the cash paid in dialog box
  const perMedRef = useRef(null); // Ref for per medicine discount input field

  useEffect(() => {
    if (finalizeDialogOpen) {
      setTimeout(() => {
        if (discountRef.current) {
          discountRef.current.focus();
          discountRef.current.select();
        }
      }, 100);
    }
  }, [finalizeDialogOpen]);

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
      const response = await api.post("/invoice/add-item", {
        medicineId: selectedMedicine.id,
        qty: quantity,
        medDiscount: perMedicineDiscount || 0,
      });
      const successMesssage = response.data.message;
      toast.success(successMesssage);
      setSelectedMedicine(null);
      setQuantity(1);
      setPerMedicineDiscount(0);
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

  const changeFocusToDiscount = () => {
    setTimeout(() => {
      perMedRef.current?.focus();
      perMedRef.current?.select();
    }, 100);
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
      const response = await api.post("/invoice/finalize", {
        cashPaid,
        discountedPercentage: discountPercentage,
        customerName: customerName || "",
      });
      const { message } = response.data;
      toast.success(message);
      setFinalizeDialogOpen(false);
      setCurrentInvoice(null);
      setDiscountPercentage(0);
      setCashPaid(0);
      setCustomerName("");
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
    const discount = (grossTotal * discountPercentage) / 100 || 0;
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

  const handleFinalizeAndPrint = async () => {
    if (cashPaid < netTotal) {
      toast.error("Cash paid must be at least equal to net total");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/invoice/finalize", {
        cashPaid,
        discountedPercentage: discountPercentage,
        customerName: customerName || "",
      });

      const { updatedInvoice } = response.data;
      setFinalizedInvoice(updatedInvoice);
      setCurrentInvoice(null);
      setFinalizeDialogOpen(false);
      setDiscountPercentage(0);
      setCashPaid(0);
      setCustomerName("");
      setTimeout(() => {
        setPrintDialogOpen(true);
      }, 300);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to finalize invoice"
      );
    } finally {
      setLoading(false);
    }
  };

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
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${
            themeColors?.primaryColor || "#1976d2"
          }05 0%, ${themeColors?.secondaryColor || "#dc004e"}05 100%)`,
          border: `1px solid ${themeColors?.primaryColor || "#1976d2"}20`,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: themeColors?.primaryColor }}
        >
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
              slotProps={{
                input: {
                  inputProps: { min: 1 },
                },
              }}
              fullWidth
              size="large"
              inputRef={quantityRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && selectedMedicine && quantity > 0) {
                  changeFocusToDiscount();
                }
              }}
            />
          </Grid>

          <Grid item xs={6} sm={6} md={2}>
            <TextField
              label="Discount Per Medicine (%)"
              type="number"
              value={perMedicineDiscount}
              inputRef={perMedRef}
              onChange={(e) =>
                setPerMedicineDiscount(parseFloat(e.target.value))
              }
              slotProps={{
                input: {
                  inputProps: { min: 0, max: 100 },
                },
              }}
              fullWidth
              size="large"
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
                  <TableCell>Discount (%)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentInvoice.invoiceMedicines?.map((item) => {
                  const medTotal = Number(item.salesPrice) * Number(item.qty);
                  const discountAmt =
                    ((Number(item.medDiscount) || 0) / 100) * medTotal;
                  const medicineNetTotal = medTotal - discountAmt;
                  return (
                    <TableRow key={item.medicineId}>
                      <TableCell>{item.medicine?.name}</TableCell>
                      <TableCell> {item.salesPrice.toFixed(2)}</TableCell>
                      <TableCell> {item.medDiscount.toFixed(2)}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value);
                            if (!isNaN(newQty)) {
                              handleUpdateQuantity(item.medicineId, newQty);
                            }
                          }}
                          variant="outlined"
                          size="small"
                          slotProps={{
                            input: {
                              inputProps: {
                                min: 1,
                                style: { textAlign: "center", width: "70px" },
                              },
                            },
                          }}
                        />
                      </TableCell>

                      <TableCell>{medicineNetTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleRemoveFromInvoice(item.medicineId)
                          }
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                    <Typography>
                      Discount ({discountPercentage || 0}%):
                    </Typography>
                    <Typography>-{discount?.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Net Total:</Typography>
                    <Typography variant="h6">
                      {netTotal?.toFixed(2) || 0}
                    </Typography>
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
              placeholder="0"
              value={discountPercentage || ""}
              onChange={(e) =>
                setDiscountPercentage(parseFloat(e.target.value))
              }
              inputRef={discountRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Percent />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                },
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Cash Paid"
              type="number"
              placeholder="0"
              value={cashPaid || ""}
              onChange={(e) => setCashPaid(parseFloat(e.target.value))}
              inputRef={cashPaidRef}
              slots={{
                inputAdornmentStart: InputAdornment,
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">Rs.</InputAdornment>
                  ),
                  inputProps: { min: 0 },
                },
              }}
              fullWidth
              sx={{ mb: 2 }}
            />

            <TextField
              label="Customer Name (Optional)"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
            variant="contained"
            color="primary"
            disabled={loading || cashPaid < netTotal || !cashPaid}
            onClick={handleFinalizeAndPrint}
          >
            Finalize & Print
          </Button>

          <Button
            onClick={handleFinalizeInvoice}
            variant="contained"
            disabled={loading || cashPaid < netTotal || !cashPaid}
          >
            Finalize Invoice
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice Details
          {finalizedInvoice && (
            <Typography variant="body2" color="text.secondary">
              ID: #INV-{String(finalizedInvoice.invoiceNumber).padStart(6, "0")}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent id="print-section">
          {finalizedInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Invoice Info
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {new Date(finalizedInvoice.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {finalizedInvoice.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cashier:</strong>{" "}
                    {finalizedInvoice.user?.firstName || "N/A"}
                  </Typography>
                  {finalizedInvoice.customer && (
                    <Typography variant="body2">
                      <strong>Customer:</strong>{" "}
                      {finalizedInvoice.customer || "N/A"}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gross Total:</strong> Rs.{" "}
                    {finalizedInvoice.grossTotal?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Discount:</strong> Rs.{" "}
                    {finalizedInvoice.discount?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Net Total:</strong> Rs.{" "}
                    {finalizedInvoice.netTotal?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cash Paid:</strong> Rs.{" "}
                    {finalizedInvoice.cashPaid?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Balance:</strong> Rs.{" "}
                    {finalizedInvoice.balance?.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Discount (%)</TableCell>
                      <TableCell>Price after Discount</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finalizedInvoice.invoiceMedicines?.map((item, i) => {
                      const medTotal =
                        Number(item.salesPrice) * Number(item.qty);
                      const discountAmt =
                        ((Number(item.medDiscount) || 0) / 100) * medTotal;
                      const medicineNetTotal = medTotal - discountAmt;

                      const priceAfterDiscount =
                        Number(item.salesPrice || 0) -
                        (Number(item.salesPrice || 0) *
                          Number(item.medDiscount || 0)) /
                          100;
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            {item.medicine?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{item.salesPrice?.toFixed(2)}</TableCell>
                          <TableCell>{item.medDiscount?.toFixed(2)}</TableCell>
                          <TableCell>{priceAfterDiscount.toFixed(2)}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{medicineNetTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ displayPrint: "none" }}>
          <Button onClick={() => setPrintDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
