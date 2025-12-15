import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import { Search, Receipt, Visibility, Print } from "@mui/icons-material";
import { toast } from "react-toastify";
import api from "../utils/axiosConfig";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = invoices.filter((invoice) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.id.toLowerCase().includes(searchLower) ||
          invoice.user?.name?.toLowerCase().includes(searchLower) ||
          invoice.status.toLowerCase().includes(searchLower)
        );
      });
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/invoice");
      setInvoices(response.data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotals = () => {
    const totalInvoices = invoices.length;
    const completedInvoices = invoices.filter(
      (inv) => inv.status === "completed"
    ).length;
    const totalRevenue = invoices
      .filter((inv) => inv.status === "completed")
      .reduce((sum, inv) => sum + (inv.netTotal || 0), 0);

    return { totalInvoices, completedInvoices, totalRevenue };
  };

  const { totalInvoices, completedInvoices, totalRevenue } = calculateTotals();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoice Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalInvoices}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Invoices
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{completedInvoices}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box>
                  <Typography variant="h6">
                    Rs. {totalRevenue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Invoices
        </Typography>

        <TextField
          label="Search Invoices"
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
                <TableCell>Invoice ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Gross Total</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Net Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #INV-{String(invoice.invoiceNumber).padStart(6, "0")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(invoice.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {invoice.customer || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {invoice.grossTotal?.toFixed(2) || "0.00"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {invoice.discount?.toFixed(2) || "0.00"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {invoice.netTotal?.toFixed(2) || "0.00"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewDetails(invoice)}
                      size="small"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredInvoices.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm
                ? "No invoices found matching your search"
                : "No invoices available"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice Details
          {selectedInvoice && (
            <Typography variant="body2" color="text.secondary">
              ID: #INV-{String(selectedInvoice.invoiceNumber).padStart(6, "0")}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Invoice Header */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Invoice Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedInvoice.createdAt)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong>
                    <Chip
                      label={selectedInvoice.status}
                      color={getStatusColor(selectedInvoice.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cashier:</strong>{" "}
                    {selectedInvoice.user?.firstName || "N/A"}
                  </Typography>

                  {selectedInvoice.customer && (
                    <Typography variant="body2">
                      <strong>Customer:</strong>{" "}
                      {selectedInvoice.customer || "N/A"}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Financial Summary
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gross Total:</strong> Rs.{" "}
                    {selectedInvoice.grossTotal?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Discount:</strong> Rs.{" "}
                    {selectedInvoice.discount?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Net Total:</strong> Rs.{" "}
                    {selectedInvoice.netTotal?.toFixed(2)}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Cash Paid:</strong> Rs.{" "}
                    {selectedInvoice.cashPaid?.toFixed(2)}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Balance:</strong> Rs.{" "}
                    {selectedInvoice.balance?.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Invoice Items */}
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              {selectedInvoice.invoiceMedicines &&
              selectedInvoice.invoiceMedicines.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Discount %</TableCell>
                        <TableCell>Price after Discount</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.invoiceMedicines.map((item, index) => {
                        const priceAfterDiscount =
                          Number(item.salesPrice || 0) -
                          (Number(item.salesPrice || 0) *
                            Number(item.medDiscount || 0)) /
                            100;

                        // 🧮 calculate total
                        const total =
                          priceAfterDiscount * Number(item.qty || 0);

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.medicine?.name || "Unknown Medicine"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {item.salesPrice?.toFixed(2) || "0.00"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {item.medDiscount?.toFixed(2) || "0.00"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {priceAfterDiscount.toFixed(2) || "0.00"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {item.qty}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {total.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items found in this invoice
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
