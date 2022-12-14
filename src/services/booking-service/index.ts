import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-reposiory";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function checkTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw "forbidden";
  }
}

async function checkRoom(roomId: number) {
  if (!roomId) {
    throw notFoundError();
  }
  const room = await hotelRepository.findRoomById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const countBooking = await bookingRepository.findBookingByRoomId(roomId);
  if (countBooking.length >= room.capacity) {
    throw "forbidden";
  }
}

async function getBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const booking = await bookingRepository.findBooking(userId);

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  await checkRoom(roomId);
  await checkTicket(userId);
  await bookingRepository.createBooking(userId, roomId);
  const booking = await bookingRepository.findBooking(userId);

  return { bookingId: booking.id };
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  await checkRoom(roomId);
  await checkTicket(userId);

  let booking = await bookingRepository.findBooking(userId);
  if (!booking) {
    throw "forbidden";
  }
  await bookingRepository.updateBooking(roomId, booking.id);
  booking = await bookingRepository.findBooking(userId);

  return { bookingId: booking.id };
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
