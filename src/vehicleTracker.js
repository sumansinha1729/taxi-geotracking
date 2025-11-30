const vehicleStates = new Map();

/**
 * Get the current state of a vehicle
 */
function getVehicleState(vehicleId) {
  return vehicleStates.get(vehicleId) || null;
}

/**
 * Update vehicle state with new location and zones
 */
function updateVehicleState(vehicleId, lat, lon, currentZones) {
  const previousState = vehicleStates.get(vehicleId);

  const newState = {
    vehicleId,
    latitude: lat,
    longitude: lon,
    currentZones,
    lastUpdated: new Date().toISOString()
  };

  vehicleStates.set(vehicleId, newState);

  return {
    previousState,
    newState
  };
}

/**
 * Detect zone transitions (enter/exit events)
 */
function detectZoneTransitions(previousZones, currentZones) {
  const prev = new Set(previousZones || []);
  const curr = new Set(currentZones || []);

  const entered = [...curr].filter(zone => !prev.has(zone));
  const exited = [...prev].filter(zone => !curr.has(zone));

  return { entered, exited };
}

/**
 * Get all vehicle states (for debugging/monitoring)
 */
function getAllVehicles() {
  return Array.from(vehicleStates.values());
}

module.exports = {
  getVehicleState,
  updateVehicleState,
  detectZoneTransitions,
  getAllVehicles
};
