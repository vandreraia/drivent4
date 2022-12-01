import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.animal.type(),
      capacity: faker.datatype.number(),
      hotelId: hotelId,
    }
  });
}

export async function createRoomWithHotelIdAndCapacity1(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 1,
      hotelId: hotelId,
    }
  });
}
