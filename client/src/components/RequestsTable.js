"use client";

import { useState, useEffect } from "react";

export default function RequestsTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`${process.env.BASE_URL}/appointment/user`);
      const d = await res.json();
      setData(d);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const accept = async (id) => {
    await fetch(`${process.env.BASE_URL}/appointment/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: "accepted",
        docName: "Dr X",
        roomNo: "101",
      }),
    });
  };

  const reject = async (id) => {
    await fetch(`${process.env.BASE_URL}/appointment/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        status: "rejected",
        reason: "Not available",
      }),
    });
  };

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Service</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {data.map((r) => (
          <tr key={r.id}>
            <td>{r.service}</td>
            <td>{r.status}</td>
            <td>
              {r.status === "pending" && (
                <>
                  <button onClick={() => accept(r.id)}>Accept</button>
                  <button onClick={() => reject(r.id)}>Reject</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}