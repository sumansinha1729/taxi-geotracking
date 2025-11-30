// Geographic zones for the taxi service
// Using simple rectangular boundaries for efficiency

const zones = [
  {
    id: 'downtown',
    name: 'Downtown Area',
    type: 'rectangle',
    bounds: {
      north: 40.7589,
      south: 40.7489,
      east: -73.9789,
      west: -73.9889
    }
  },
  {
    id: 'airport',
    name: 'Airport Zone',
    type: 'rectangle',
    bounds: {
      north: 40.6500,
      south: 40.6300,
      east: -73.7700,
      west: -73.7900
    }
  },
  {
    id: 'financial_district',
    name: 'Financial District',
    type: 'rectangle',
    bounds: {
      north: 40.7100,
      south: 40.7000,
      east: -74.0050,
      west: -74.0150
    }
  }
];

/**
 * Check if a point is inside a rectangular zone
 */
function isPointInRectangle(lat, lon, bounds) {
  return lat >= bounds.south &&
         lat <= bounds.north &&
         lon >= bounds.west &&
         lon <= bounds.east;
}

/**
 * Find all zones that contain the given coordinates
 */
function findZonesForLocation(lat, lon) {
  const containingZones = [];

  for (const zone of zones) {
    if (zone.type === 'rectangle') {
      if (isPointInRectangle(lat, lon, zone.bounds)) {
        containingZones.push(zone.id);
      }
    }
  }

  return containingZones;
}

/**
 * Get zone details by ID
 */
function getZoneById(zoneId) {
  return zones.find(zone => zone.id === zoneId);
}

module.exports = {
  zones,
  findZonesForLocation,
  getZoneById
};
