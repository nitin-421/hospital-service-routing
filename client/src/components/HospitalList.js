"use client";

import { useState } from "react";  

export default function HospitalList({
  hospitals,
  selectedHospital,
  setSelectedHospital,
  selectedService,
}) {
  const [bookedIndex, setBookedIndex] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [details, setDetails] = useState(null);

  const handleBook = async (hospital, index) => {
    try {
      const res = await fetch("https://hospital-resource-routing-sxdu.onrender.com/user/appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hospitalId: hospital.id,
            service: selectedService,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("Server error:", err);
        return;
      }
  
      const data = await res.json();
      console.log("Inserted:", data);
  
      setBookedIndex(index);
      setStatus("pending");
  
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  return (
    <div className="space-y-4">
      {hospitals.map((h, i) => {
        if (bookedIndex !== null && bookedIndex !== i)
          return null;
  
        const isActive = selectedHospital === i;
  
        return (
          <div
            key={i}
            onClick={() => setSelectedHospital(i)}
            className={`
              cursor-pointer
              rounded-xl
              p-4
              border
              transition-all
              duration-300
              ${isActive
                ? "bg-blue-50 border-blue-500 shadow-xl"
                : "bg-white shadow-md hover:shadow-xl "
              }
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800">
                {h.name}
              </h3>
            </div>
  
            {/* Distance */}
            <div className="flex items-center justify-between text-gray-600 text-sm mb-3">
              <span>Distance: {Number(h.distance*11100).toFixed(2)} km</span>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-md">
              {h.available} available
              </span>
            </div>
          
            {/* book appointment button */}
            {bookedIndex !== i && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                    handleBook(h, i);
                  }}
                  className="w-full text-white py-2 hover:shadow-lg bg-linear-to-r from-blue-500 to-blue-600 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                  Book Appointment
                  </button>
                )}
                {/* Status */}
            {bookedIndex === i && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
                <p className="font-medium">
                  Status:{" "}
                  <span
                    className={
                      status === "accepted"
                        ? "text-green-400"
                        : status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }
                  >
                    {status}
                  </span>
                </p>  
                {status === "rejected" && (
                  <p className="mt-2 text-sm text-red-500">
                    Reason: {details?.reason}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}