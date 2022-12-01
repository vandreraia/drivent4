import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    }
  });
}

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function updateBooking(roomId: number, id: number) {
  return prisma.booking.update({
    where: {
      id
    },
    data: {
      roomId
    }
  });
}
const bookingRepository = {
  findBooking,
  createBooking,
  findBookingByRoomId,
  updateBooking
};

export default bookingRepository;
