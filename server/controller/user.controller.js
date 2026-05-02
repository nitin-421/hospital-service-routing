import { PrismaClient } from "../generated/prisma/client.js";
const prisma = new PrismaClient();

export const createAppointment = async (req, res) => {
  try {
    const { hospitalId, service } = req.body;

    if (!hospitalId || !service) {
      return res.status(400).json({ message: "hospitalId and service required" });
    }

    const appointment = await prisma.appointments.create({
      data: {
        hospitalId,
        service,
        status: "pending",
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const data = await prisma.appointments.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};