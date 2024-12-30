import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { bookSeats, fetchSeats, resetSeats } from "./apiService";

const App = () => {
  const ROWS = 11; // Total rows
  const SEATS_PER_ROW = 7; // Seats per row
  const TOTAL_SEATS = ROWS * SEATS_PER_ROW; // Total seats

  const [seats, setSeats] = useState(Array(TOTAL_SEATS).fill("available"));
  const [numSeats, setNumSeats] = useState(""); // Number of seats to book
  const [isBookingLoading, setIsBookingLoading] = useState(false); // Booking loading state
  const [isResetLoading, setIsResetLoading] = useState(false); // Reset loading state
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  useEffect(() => {
    const loadSeats = async () => {
      setIsBookingLoading(true); // Show loader when loading seats
      try {
        const seatData = await fetchSeats();
        setSeats(seatData?.map((seat) => seat.status));
      } catch (error) {
        console.error(error);
        alert("Error loading seat data. Please try again later.");
      } finally {
        setIsBookingLoading(false); // Hide loader when seats are loaded
      }
    };

    loadSeats();
  }, []);
  const bookedSeatsCount = seats.filter((seat) => seat === "booked").length;
  const availableSeatsCount = seats.filter((seat) => seat === "available").length;

  const handleBookSeats = async () => {
    const n = parseInt(numSeats);

    if (isNaN(n) || n <= 0) {
      alert("Please enter a valid number of seats.");
      return;
    }
    if (n > 7) {
      alert("You can book a maximum of 7 seats at a time.");
      return;
    }

    const updatedSeats = [...seats];
    let bookedSeats = [];
    let seatsToBook = n;
    
    


 // Step 1: Try to book all seats in one row
    for (let row = 0; row < ROWS; row++) {
      const rowStart = row * SEATS_PER_ROW;
      const rowEnd = rowStart + SEATS_PER_ROW;
      const currentRow = updatedSeats.slice(rowStart, rowEnd);

      const availableSeats = currentRow.reduce((indices, seat, index) => {
        if (seat === "available") indices.push(index + rowStart);
        return indices;
      }, []);
// If the row can fully accommodate the request
      if (availableSeats.length >= seatsToBook) {
        for (let i = 0; i < seatsToBook; i++) {
          updatedSeats[availableSeats[i]] = "booked";
          bookedSeats.push(availableSeats[i]);
        }
        seatsToBook = 0;
        break;
      }
    }
 // Step 2: If no single row can accommodate, book across rows
    if (seatsToBook > 0) {
      for (let row = 0; row < ROWS; row++){
        const rowStart = row * SEATS_PER_ROW;
        const rowEnd = rowStart + SEATS_PER_ROW;
        const currentRow = updatedSeats.slice(rowStart, rowEnd);

        const availableSeats = currentRow.reduce((indices, seat, index) => {
          if (seat === "available") indices.push(index + rowStart);
          return indices;
        }, []);

        for (let i = 0; i < availableSeats.length && seatsToBook > 0; i++) {
          updatedSeats[availableSeats[i]] = "booked";
          bookedSeats.push(availableSeats[i]);
          seatsToBook--;
        }

        if (seatsToBook === 0) break;
      }
    }

    if (seatsToBook > 0) {
      alert("Not enough seats available to fulfill your booking.");
      return;
    }

    setIsBookingLoading(true); 
    try {
      await bookSeats(bookedSeats?.map((seat) => seat + 1)); 
      setSeats(updatedSeats);
      setSuccessMessage(
        `Seat Booking Successful! Seats: ${bookedSeats
          ?.map((i) => i + 1)
          .join(", ")}`
      ); // Set success message
      setTimeout(() => setSuccessMessage(""), 3000); // Hide after 3 seconds
      setNumSeats(""); 
    } catch (error) {
      console.error("Error booking seats:", error);
      alert("Failed to book seats. Please try again later.");
    } finally {
      setIsBookingLoading(false); 
    }
  };

  const handleReset = async () => {
    setIsResetLoading(true); 
    try {
      await resetSeats(); 
      const refreshedSeats = await fetchSeats(); 
      setSeats(refreshedSeats?.map((seat) => seat.status)); 
      alert("All bookings have been reset.");
    } catch (error) {
      console.error("Error resetting seats:", error);
      alert("Failed to reset bookings.");
    } finally {
      setIsResetLoading(false); 
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: "1rem",
        minHeight: "96vh",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Ticket Booking
      </Typography>
  
  
      <Box
        sx={{
          width: "90%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
          marginTop: "2rem",
        }}
      >
        {isBookingLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Box
              sx={{
                width: "30%",
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "15px",
                padding: "1rem",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              {seats?.map((seat, index) => (
                <Button
                  key={index}
                  variant="contained"
                  sx={{
                    backgroundColor:
                      seat === "available" ? "#28a745" : "#ffc107",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor:
                        seat === "available" ? "#218838" : "#e0a800",
                    },
                    borderRadius: "8px",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
  
            <Box
              sx={{
                width: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                gap: "1.5rem",
              }}
            >
              <Typography variant="h6">Book Seats</Typography>
              <TextField
                variant="outlined"
                label="Enter number of seats"
                type="number"
                value={numSeats}
                onChange={(e) => setNumSeats(e.target.value)}
                sx={{ width: "100%" }}
              />
              <Box sx={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBookSeats}
                  disabled={isBookingLoading}
                >
                  {isBookingLoading ? <CircularProgress size={24} /> : "Book"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleReset}
                  disabled={isResetLoading}
                >
                  {isResetLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Reset Booking"
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
  
      <Box
        sx={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "left",
          gap: "2rem",
          padding: "1rem",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          width: "88%",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#ffc107",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
          }}
        >
          Booked Seats = {bookedSeatsCount}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#28a745",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
          }}
        >
          Available Seats = {availableSeatsCount}
        </Typography>
      </Box>
      {successMessage && (
        <Alert
          severity="success"
          sx={{
            marginBottom: "1rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            fontWeight: "bold",
          }}
        >
          {successMessage}
        </Alert>
      )}
    </Box>
  );
};

export default App;
