import { PrismaClient } from "../generated/prisma/client.js";
const prisma = new PrismaClient();


export const getHospitalAppointments = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const id = parseInt(hospitalId);

    // 1. Fetch hospital name
    const hospital = await prisma.hospitals.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // 2. Fetch appointments
    const appointments = await prisma.appointments.findMany({
      where: { hospitalId: id },
      orderBy: { createdAt: "desc" },
    });

    // 3. Send structured response
    return res.status(200).json({
      hospitalName: hospital.name,
      appointments,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateAppointmentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // get appointment first
    const appointment = await prisma.appointments.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🔥 If accepted → reduce availability
    if (status === "accepted") {
      const serviceMap = {
        beds: "beds",
        icu: "icu_beds",
        ventilator: "ventilators",
        cardiology: "cardiologists",
        stroke: "stroke_doctors",
        operation: "operation_theatres",
      };

      const field = serviceMap[appointment.service];

      await prisma.hospital_resources.updateMany({
        where: {
          hospital_id: appointment.hospitalId,
        },
        data: {
          [field]: {
            decrement: 1,
          },
        },
      });
    }

    // update appointment
    const updated = await prisma.appointments.update({
      where: { id: parseInt(bookingId) },
      data: {
        status,
        reason: status === "rejected" ? reason : null,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};