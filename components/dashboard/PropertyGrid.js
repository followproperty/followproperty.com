import React from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties = [], watchlistId }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} watchlistId={watchlistId} />
      ))}
    </div>
  );
}
