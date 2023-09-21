const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Local variables to store data 
const rooms = [];
const bookings = [];
const customers = [];


// Endpoint to create a room
app.post('/rooms', (req, res) => {
  const { numberOfSeats, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    numberOfSeats,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.status(201).json(room);
});

// Endpoint to book a room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;
  
    // Check if the room is already booked for the same date and time
    const conflictingBooking = bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        booking.date === date &&
        (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        )
    );
  
    if (conflictingBooking) {
      return res.status(400).json({ error: 'Room is already booked for the same date and time.' });
    }
  
    const booking = {
      id: bookings.length + 1,
      customerName,
      date,
      startTime,
      endTime,
      roomId,
    };
    bookings.push(booking);
    res.status(201).json(booking);
  });

// Endpoint to list all rooms with booked data
app.get('/rooms/booked', (req, res) => {
  const result = rooms.map((room) => {
    const booking = bookings.find((b) => b.roomId === room.id);
    return {
      roomName: `Room ${room.id}`,
      bookedStatus: booking ? 'Booked' : 'Available',
      customerName: booking ? booking.customerName : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

// Endpoint to list all customers with booked data
app.get("/customers/booked", (req, res) => {
  const result = customers.map((customer) => {
    const booking = bookings.find((b) => b.customerName === customer.name);
    return {
      customerName: customer.name,
      roomName: booking ? booking.roomId : null,
      date: booking ? booking.date : null,
      startTime: booking ? booking.startTime : null,
      endTime: booking ? booking.endTime : null,
    };
  });
  res.json(result);
});

// Endpoint to list how many times a customer has booked a room
app.get('/customers/booking-count', (req, res) => {
  const { customerName } = req.query;
  const customerBookings = bookings.filter((b) => b.customerName === customerName);
  res.json({
    customerName,
    bookingCount: customerBookings.length,
    bookings: customerBookings,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});