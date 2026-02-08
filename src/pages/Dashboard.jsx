import React,{ useState, useEffect, useRef, useContext } from "react";
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
  Delete,
  Search,
  Receipt,
  Print,
  Percent,
} from "@mui/icons-material";
import "./Dashboard.css"
import { toast } from "react-toastify";
import api from "../utils/axiosConfig";
import { ThemeContext } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

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
  const {organization} = useAuth();

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
    const filtered = medicines.filter((medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [searchTerm, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get("/medicine");
      setMedicines(response.data);
    } catch (error) {
      toast.error("Failed to fetch medicines");
      console.error("Error fetching medicines:", error);
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
    if (!selectedMedicine.qty ) return toast.error(selectedMedicine.name+" is out of stock")

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
      setSelectedMedicine("")
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
      fetchMedicines()
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
      fetchMedicines()
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

  const handleExportToCSV = async () => {
    // 1. VALIDATION CHECK
    if (cashPaid < netTotal) {
      toast.error("Cash paid must be at least equal to net total");
      return;
    }

    try {
      setLoading(true);

      // 2. CALL API TO FINALIZE (Save to DB)
      const response = await api.post("/invoice/finalize", {
        cashPaid,
        discountedPercentage: discountPercentage,
        customerName: customerName || "",
      });

      const { updatedInvoice } = response.data;

      // 3. UPDATE UI STATE
      toast.success("Invoice saved and exported successfully");
      fetchMedicines(); 
      setCurrentInvoice(null);
      setFinalizeDialogOpen(false);
      setDiscountPercentage(0);
      setCashPaid(0);
      setCustomerName("");

      // =========================================================
      // 4. BUILD CSV CONTENT (TOP TO BOTTOM)
      // =========================================================
      
      let csvContent = "data:text/csv;charset=utf-8,";

      // --- SECTION A: ORGANIZATION HEADER ---
      // We use quotes "..." around fields to handle commas safely
      csvContent += `"${organization?.orgTitle || "Pharmacy Name"}"\n`;
      csvContent += `"${organization?.address || "Address"}"\n`;
      csvContent += `"${organization?.phone || "Phone"}"\n`;
      csvContent += `"License No: ${organization?.licenseNo || "N/A"}","NTN: ${organization?.ntnNo || "N/A"}"\n`;
      csvContent += "\n"; // Empty line for spacing

      // --- SECTION B: INVOICE META DATA ---
      csvContent += `"Invoice #:","${String(updatedInvoice.invoiceNumber).padStart(6, '0')}"\n`;
      csvContent += `"Date:","${new Date(updatedInvoice.createdAt).toLocaleString()}"\n`;
      csvContent += `"Cashier:","${updatedInvoice.user?.firstName || "N/A"}"\n`;
      csvContent += `"Customer:","${updatedInvoice.customer || "N/A"}"\n`;
      csvContent += "\n";

      // --- SECTION C: ITEMS TABLE HEADERS ---
      const headers = [
        "Description", 
        "Price", 
        "Discount (%)", 
        "Disc. Price", 
        "Qty", 
        "Total"
      ];
      csvContent += headers.join(",") + "\n";

      // --- SECTION D: ITEMS DATA ---
      updatedInvoice.invoiceMedicines.forEach((item) => {
        const unitPrice = Number(item.salesPrice) || 0;
        const discountPercent = Number(item.medDiscount) || 0;
        const priceAfterDiscount = unitPrice - (unitPrice * discountPercent / 100);
        const lineTotal = priceAfterDiscount * item.qty;

        // Escape quotes in medicine names (e.g. 5" Bandage becomes 5"" Bandage)
        const safeName = item.medicine?.name ? `"${item.medicine.name.replace(/"/g, '""')}"` : '"Unknown"';

        const row = [
          safeName,
          unitPrice.toFixed(2),
          discountPercent.toFixed(2),
          priceAfterDiscount.toFixed(2),
          item.qty,
          lineTotal.toFixed(2)
        ];

        csvContent += row.join(",") + "\n";
      });

      // --- SECTION E: TOTALS (Aligned to Right) ---
      csvContent += "\n"; 
      csvContent += `,,,,"Gross Total",${updatedInvoice.grossTotal?.toFixed(2)}\n`;
      csvContent += `,,,,"Discount",-${updatedInvoice.discount?.toFixed(2)}\n`;
      csvContent += `,,,,"NET TOTAL",${updatedInvoice.netTotal?.toFixed(2)}\n`;
      csvContent += `,,,,"Cash Paid",${updatedInvoice.cashPaid?.toFixed(2)}\n`;
      csvContent += `,,,,"Change",${updatedInvoice.balance?.toFixed(2)}\n`;

      // --- SECTION F: FOOTER MESSAGES ---
      csvContent += "\n";
      csvContent += `"Thank you for your purchase!"\n`;
      csvContent += `"Loose and Fridge Items are not refundable"\n`;
      csvContent += `"Return Will Be Accepted Within 7 Days with Original Receipt"\n`;
      csvContent += `"Software by Agile Pharmacy"\n`;

      // =========================================================
      // 5. DOWNLOAD FILE
      // =========================================================
      
      // Note: We remove the 'data:text/csv...' prefix when using Blob
      const cleanCsvContent = csvContent.replace("data:text/csv;charset=utf-8,", "");
      const blob = new Blob([cleanCsvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const safeInvoiceNum = String(updatedInvoice.invoiceNumber || "000");
      link.setAttribute("download", `Invoice_${safeInvoiceNum}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save and export invoice"
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
          <Grid  sx={{ width: "100%" }}>
            <Autocomplete
              sx={{ width: "100%" }}
              freeSolo
              options={filteredMedicines}
              getOptionLabel={(option) => option.name || ""}
              value={selectedMedicine }
              onChange={(event, newValue) => {
                if(newValue){
                  handleMedicineSelect(newValue);
                }else {
                  setSelectedMedicine(null);
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
              renderOption={(props, option) => {
                return(
                <Box component="li" {...props} key={option.id}>
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
              )}}
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
              label="Discount(%)"
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
                  <TableCell>Price after Discount</TableCell>
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

                  const priceAfterDiscount =
                    Number(item.salesPrice || 0) -
                    (Number(item.salesPrice || 0) *
                      Number(item.medDiscount || 0)) /
                      100;
                  return (
                    <TableRow key={item.medicineId}>
                      <TableCell>{item.medicine?.name}</TableCell>
                      <TableCell> {item.salesPrice.toFixed(2)}</TableCell>
                      <TableCell> {item.medDiscount.toFixed(2)}</TableCell>
                      <TableCell> {priceAfterDiscount.toFixed(2)}</TableCell>
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
              Net Total:  {netTotal.toFixed(2)}
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

          <Button
            variant="contained"
            color="primary"
            disabled={loading || cashPaid < netTotal || !cashPaid}
            onClick={handleExportToCSV}
          >
            Export Excel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        scroll="paper"
      >

        <DialogContent id="print-section" style={{width:"80mm", padding:"15px"}}>
          {finalizedInvoice && (
            <Box
              sx={{
                textAlign: "center",
                p: 1,
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {organization?.orgTitle || "Pharmacy Name"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {organization?.address || "Pharmacy Address"}
                <br />
                {organization?.phone || "Contact Info"}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{ fontSize: "10px", mb: 1 }}
              >
                <Typography sx={{fontSize:'10px'}}>
                  Inv #: {String(finalizedInvoice.invoiceNumber).padStart(6, "0")}
                </Typography>
                <Typography sx={{fontSize:'10px'}}>
                  {new Date(finalizedInvoice.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography sx={{fontSize:'10px'}}>
                  Cashier: {finalizedInvoice.user?.firstName || "N/A"}
                </Typography>

                <Typography sx={{fontSize:'10px'}}>
                    Customer: {finalizedInvoice.customer || "N/A"}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>

                <Typography sx={{fontSize:'10px'}}>
                    License No: {organization.licenseNo || "N/A"}
                </Typography>

                <Typography sx={{fontSize:'10px'}}>
                    NTN No: {organization.ntnNo || "N/A"}
                </Typography>
              </Box>

              <Divider sx={{ border:"1px dashed black"}}/>

              {/* Items Table - Simplified for Receipt */}
              <Table size="small" sx={{ "& td, & th": { padding: "4px 0", fontSize: "10px" } }}>
                  <TableHead>
                    <TableRow>
                      {/* <TableCell style={{fontWeight: "bold"}}>#</TableCell> */}
                      <TableCell style={{fontWeight: "bold"}}>Description Price</TableCell>
                      <TableCell style={{fontWeight: "bold"}}>Discount (%)</TableCell>
                      <TableCell style={{fontWeight: "bold"}}>Disc. Price</TableCell>
                      <TableCell style={{fontWeight: "bold"}}>Qty</TableCell>
                      <TableCell style={{fontWeight: "bold"}}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {finalizedInvoice.invoiceMedicines?.map((item) => {
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
                        <React.Fragment key={item.medicineId}>
                        <TableRow>
                          {/* <TableCell>{i+1}</TableCell> */}
                          <TableCell  colSpan={4} className="table-name-data">
                            {item.medicine?.name || "Unknown"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          {/* <TableCell></TableCell> */}
                          <TableCell>{item.salesPrice?.toFixed(2)}</TableCell>
                          <TableCell>{item.medDiscount?.toFixed(2)}</TableCell>
                          <TableCell>{priceAfterDiscount.toFixed(2)}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{medicineNetTotal.toFixed(2)}</TableCell>
                        </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
              </Table>

              <Divider sx={{ border:"1px dashed black",my:2}}/>

              {/* Totals Section */}
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{fontSize:'10px'}}>Gross Total:</Typography>
                <Typography sx={{fontSize:'10px'}}>
                  {finalizedInvoice.grossTotal?.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{fontSize:'10px'}}>Discount:</Typography>
                <Typography sx={{fontSize:'10px'}}>
                  -{finalizedInvoice.discount?.toFixed(2)}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                mb={1}
                sx={{ fontWeight: "bold" }}
              >
                <Typography sx={{fontSize:'10px', fontWeight:"bold"}}>Net Total:</Typography>
                <Typography sx={{fontSize:'10px', fontWeight:"bold"}}>
                  {finalizedInvoice.netTotal?.toFixed(2)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{fontSize:'10px'}}>Cash Paid:</Typography>
                <Typography sx={{fontSize:'10px'}}>
                  {finalizedInvoice.cashPaid?.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{fontSize:'10px'}}>Change:</Typography>
                <Typography sx={{fontSize:'10px'}}>
                  {finalizedInvoice.balance?.toFixed(2)}
                </Typography>
              </Box>

             <Divider sx={{ border:"1px dashed black",my:2}}/>
              <Typography sx={{fontSize:'10px'}} display="block" align="start">
                Thank you for your purchase!
              </Typography>
              <Typography sx={{fontSize:'10px'}} display="block" align="start">
                Loose and Fridge Items are not refundable
              </Typography>
              <Typography sx={{fontSize:'10px'}} display="block" align="start">
                Return Will Be Accepted Within 7 Days with Original Receipt
              </Typography>
              <Typography sx={{fontSize:'10px'}} display="block" align="start">
                Software by Agile Pharmacy
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions className="no-print">
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