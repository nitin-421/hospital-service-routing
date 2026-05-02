"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MapView from "../components/MapView";

export default function Home() {
  const [searchData, setSearchData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  return (
    <div className="flex h-screen">

      <div className="w-1/4 p-4">
        <Sidebar
          setSearchData={setSearchData}
          hospitals={hospitals}
          setHospitals={setHospitals}
          selectedHospital={selectedHospital}
          setSelectedHospital={setSelectedHospital}
        />
      </div>

      <div className="w-3/4">
        <MapView
          searchData={searchData}
          hospitals={hospitals}
          selectedHospital={selectedHospital}
        />
      </div>

    </div>
  );
}