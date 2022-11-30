import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest"; import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createBooking } from "../factories/booking-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    // it("should respond with status 402 when user ticket is remote ", async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);
    //   const enrollment = await createEnrollmentWithAddress(user);
    //   const ticketType = await createTicketTypeRemote();
    //   const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    //   const payment = await createPayment(ticket.id, ticketType.price);
    //   //Hoteis no banco

    //   const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    //   expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    // });

    // it("should respond with status 404 when user has no enrollment ", async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);

    //   const ticketType = await createTicketTypeRemote();

    //   const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    //   expect(response.status).toEqual(httpStatus.NOT_FOUND);
    // });

    it("should respond with status 200 and booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });

    // it("should respond with status 200 and an empty array", async () => {
    //   const user = await createUser();
    //   const token = await generateValidToken(user);
    //   const enrollment = await createEnrollmentWithAddress(user);
    //   const ticketType = await createTicketTypeWithHotel();
    //   const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    //   const payment = await createPayment(ticket.id, ticketType.price);
    //   //Hoteis no banco

    //   const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    //   expect(response.status).toEqual(httpStatus.OK);
    //   expect(response.body).toEqual([]);
    // });
  });
});
