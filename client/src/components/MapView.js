"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapView({
  searchData,
  hospitals,
  selectedHospital,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [allHospitals, setAllHospitals] = useState([]);

  // Initialize map
  useEffect(() => {
    if (mapInstance.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [88.12, 24.08], // map center
      zoom: 8,
    });
  }, []);

  // Load all hospitals initially
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/locations`
        );
        const data = await res.json();
        setAllHospitals(data);
      } catch (err) {
        console.error("Error fetching hospitals:", err);
      }
    };
    fetchAll();
  }, []);

  // Show markers (initial + searched)
  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    // If user searched → show search hospitals
    const dataToShow = hospitals.length > 0 ? hospitals : allHospitals;

    // User marker
    if (searchData) {
      const userMarker = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([searchData.lng, searchData.lat])
        .addTo(mapInstance.current);

      markersRef.current.push(userMarker);
      bounds.extend([searchData.lng, searchData.lat]);
    }

    // Hospital markers
    dataToShow.forEach((h) => {
      const isInitial = hospitals.length === 0; // no search yet
    
      const marker = new mapboxgl.Marker({
        color: isInitial ? "black" : "red", // 🔥 highlight initial ones
      })
        .setLngLat([h.longitude, h.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<b>${h.name}</b><br/>${isInitial ? "All Hospitals" : "Nearest"}`
          )
        )
        .addTo(mapInstance.current);
    
      markersRef.current.push(marker);
      bounds.extend([h.longitude, h.latitude]);
    });

    if (!bounds.isEmpty()) {
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }

  }, [searchData, hospitals, allHospitals]);

  // Route drawing
  useEffect(() => {
    if (!mapInstance.current || selectedHospital === null || !searchData) return;

    const h = hospitals[selectedHospital];

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${searchData.lng},${searchData.lat};${h.longitude},${h.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = {
          type: "Feature",
          geometry: data.routes[0].geometry,
        };

        if (mapInstance.current.getLayer("route")) {
          mapInstance.current.removeLayer("route");
          mapInstance.current.removeSource("route");
        }

        mapInstance.current.addSource("route", {
          type: "geojson",
          data: route,
        });

        mapInstance.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-width": 5,
            "line-color": "#2563eb",
          },
        });
      });
  }, [selectedHospital]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
}