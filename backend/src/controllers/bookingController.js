const prisma = require('../config/db');

// Create a new booking after successful payment
exports.createBooking = async (req, res) => {
  try {
    const { userId, turfId, bookingDate, timeSlot, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = req.body;

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(401).json({ error: 'User session invalid. Please log out and sign in again.' });
    }

    const parsedDate = new Date(bookingDate);
    parsedDate.setHours(0, 0, 0, 0); 

    let slot = await prisma.turfSlot.findFirst({
      where: {
        turfId,
        date: parsedDate,
        startTime: timeSlot
      }
    });

    if (!slot) {
      slot = await prisma.turfSlot.create({
        data: {
          turfId,
          date: parsedDate,
          startTime: timeSlot,
          endTime: 'Next Hour', 
          status: 'AVAILABLE',
          price: amount
        }
      });
    }

    // Update slot status to BOOKED
    await prisma.turfSlot.update({
        where: { id: slot.id },
        data: { status: 'BOOKED' }
    });

    const booking = await prisma.booking.create({
      data: {
        userId,
        turfId,
        slotId: slot.id,
        amount,
        razorpayId: razorpayPaymentId,
        status: 'CONFIRMED',
        paymentDetail: {
          create: {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            paymentMethod: paymentMethod || "card",
            amount,
            status: "SUCCESS"
          }
        }
      },
      include: { turf: true, slot: true, paymentDetail: true }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { 
        xp: { increment: 50 },
        matchesPlayed: { increment: 1 }
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('CRITICAL Booking Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking record' });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true, user: true }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Booking already cancelled' });

    // 1. Update Booking Status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    // 2. Make Slot Available again
    if (booking.slotId) {
      await prisma.turfSlot.update({
        where: { id: booking.slotId },
        data: { status: 'AVAILABLE' }
      });
    }

    // 3. Refund to Wallet
    const amountToRefund = booking.amount;
    
    await prisma.wallet.upsert({
      where: { userId: booking.userId },
      update: {
        balance: { increment: amountToRefund },
        transactions: {
          create: {
            amount: amountToRefund,
            type: 'REFUND',
            description: `Refund for booking ${bookingId}`,
            status: 'COMPLETED'
          }
        }
      },
      create: {
        userId: booking.userId,
        balance: amountToRefund,
        transactions: {
          create: {
            amount: amountToRefund,
            type: 'REFUND',
            description: `Refund for booking ${bookingId}`,
            status: 'COMPLETED'
          }
        }
      }
    });

    // 4. Create Cancellation Request record for tracking
    await prisma.cancellationRequest.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        reason: reason || 'User requested cancellation',
        reasonType: 'PERSONAL',
        refundAmount: amountToRefund,
        refundStatus: 'PROCESSED',
        processedAt: new Date()
      }
    });

    res.json({ message: 'Booking cancelled successfully and amount refunded to wallet' });
  } catch (error) {
    console.error('Cancellation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { turf: true, slot: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map backward for frontend expectations
    const mapped = bookings.map(b => ({
      ...b,
      bookingDate: b.slot ? b.slot.date : b.createdAt,
      timeSlot: b.slot ? b.slot.startTime : 'N/A'
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { turf: true, user: true, slot: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
};
