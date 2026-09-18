"use client";
import { useState } from "react";
import { useMockStore } from "@/lib/mock/store";

export default function DataPage() {
  const { campuses, vendors, destinations, addCampus, toggleCampusActive, addVendor, toggleVendorActive, addDestination, toggleDestinationActive } = useMockStore();
  const [campusId, setCampusId] = useState(campuses[0]?.id ?? "");
  const [newVendor, setNewVendor] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newCampusName, setNewCampusName] = useState("");

  const campusVendors = vendors.filter((v) => v.campusId === campusId);
  const campusDestinations = destinations.filter((d) => d.campusId === campusId);
  const selectedCampus = campuses.find((c) => c.id === campusId);

  return (
    <div className="px-4 py-4 space-y-5 overflow-y-auto h-full">
      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Campus</p>
        <select value={campusId} onChange={(e) => setCampusId(e.target.value)} className="w-full rounded-xl px-3.5 py-3 text-sm border border-line bg-card">
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{!c.isActive && " (inactive)"}</option>
          ))}
        </select>
        {selectedCampus && (
          <button onClick={() => toggleCampusActive(campusId)} className="text-xs font-semibold mt-1.5 text-red">
            {selectedCampus.isActive ? "Deactivate this campus" : "Reactivate this campus"}
          </button>
        )}
        <div className="flex gap-2 mt-2">
          <input value={newCampusName} onChange={(e) => setNewCampusName(e.target.value)} placeholder="New campus name" className="flex-1 rounded-lg px-3 py-2 text-xs border border-line" />
          <button
            onClick={() => {
              if (!newCampusName.trim()) return;
              addCampus(newCampusName.trim());
              setNewCampusName("");
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold bg-navy text-white"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Vendors</p>
        <div className="space-y-1.5">
          {campusVendors.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg px-3 py-2 border border-line bg-card">
              <span className={`text-sm ${v.isActive ? "text-ink" : "text-faint"}`}>{v.name}{!v.isActive && " (inactive)"}</span>
              <button onClick={() => toggleVendorActive(v.id)} className={`text-xs font-semibold ${v.isActive ? "text-red" : "text-green"}`}>
                {v.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={newVendor} onChange={(e) => setNewVendor(e.target.value)} placeholder="New vendor name" className="flex-1 rounded-lg px-3 py-2 text-xs border border-line" />
          <button
            onClick={() => {
              if (!newVendor.trim()) return;
              addVendor(campusId, newVendor.trim());
              setNewVendor("");
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold bg-navy text-white"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2 text-navy">Destinations</p>
        <div className="space-y-1.5">
          {campusDestinations.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg px-3 py-2 border border-line bg-card">
              <span className={`text-sm ${d.isActive ? "text-ink" : "text-faint"}`}>{d.name}{!d.isActive && " (inactive)"}</span>
              <button onClick={() => toggleDestinationActive(d.id)} className={`text-xs font-semibold ${d.isActive ? "text-red" : "text-green"}`}>
                {d.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={newDestination} onChange={(e) => setNewDestination(e.target.value)} placeholder="New destination name" className="flex-1 rounded-lg px-3 py-2 text-xs border border-line" />
          <button
            onClick={() => {
              if (!newDestination.trim()) return;
              addDestination(campusId, newDestination.trim());
              setNewDestination("");
            }}
            className="rounded-lg px-3 py-2 text-xs font-semibold bg-navy text-white"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
