const express = require('express');
const { findZonesForLocation, zones } = require('./zones');
const {
  getVehicleState,
  updateVehicleState,
  detectZoneTransitions,
  getAllVehicles
} = require('./vehicleTracker');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

/**
 * POST /location
 * Accept location events from vehicles
 */
app.post('/location', (req, res) => {
  try {
    const { vehicleId, latitude, longitude } = req.body;

    // Validate required fields
    if (!vehicleId || latitude === undefined || longitude === undefined) {
      logger.warn('Invalid location event - missing fields', { body: req.body });
      return res.status(400).json({
        error: 'Missing required fields: vehicleId, latitude, longitude'
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      logger.warn('Invalid coordinates', { vehicleId, latitude, longitude });
      return res.status(400).json({
        error: 'Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180'
      });
    }

    // Find zones for this location
    const currentZones = findZonesForLocation(latitude, longitude);

    // Get previous state and update
    const previousState = getVehicleState(vehicleId);
    const previousZones = previousState ? previousState.currentZones : [];

    updateVehicleState(vehicleId, latitude, longitude, currentZones);

    // Detect zone transitions
    const transitions = detectZoneTransitions(previousZones, currentZones);

    // Log zone events
    if (transitions.entered.length > 0) {
      logger.info('Vehicle entered zone(s)', {
        vehicleId,
        zones: transitions.entered,
        latitude,
        longitude
      });
    }

    if (transitions.exited.length > 0) {
      logger.info('Vehicle exited zone(s)', {
        vehicleId,
        zones: transitions.exited,
        latitude,
        longitude
      });
    }

    res.json({
      success: true,
      vehicleId,
      currentZones,
      transitions
    });

  } catch (err) {
    logger.error('Error processing location event', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /vehicle/:vehicleId
 * Query current zone status for a vehicle
 */
app.get('/vehicle/:vehicleId', (req, res) => {
  try {
    const { vehicleId } = req.params;

    const state = getVehicleState(vehicleId);

    if (!state) {
      return res.status(404).json({
        error: 'Vehicle not found',
        vehicleId
      });
    }

    res.json({
      vehicleId: state.vehicleId,
      latitude: state.latitude,
      longitude: state.longitude,
      currentZones: state.currentZones,
      lastUpdated: state.lastUpdated
    });

  } catch (err) {
    logger.error('Error querying vehicle status', {
      error: err.message,
      vehicleId: req.params.vehicleId
    });
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /zones
 * List all available zones
 */
app.get('/zones', (req, res) => {
  res.json({
    zones: zones.map(z => ({
      id: z.id,
      name: z.name,
      type: z.type
    }))
  });
});

/**
 * GET /vehicles
 * List all tracked vehicles (for monitoring)
 */
app.get('/vehicles', (req, res) => {
  const vehicles = getAllVehicles();
  res.json({
    count: vehicles.length,
    vehicles
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  logger.info('Geofence tracking service started', { port: PORT });
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST   /location          - Submit vehicle location`);
  console.log(`  GET    /vehicle/:id       - Get vehicle status`);
  console.log(`  GET    /zones             - List all zones`);
  console.log(`  GET    /vehicles          - List all vehicles`);
  console.log(`  GET    /health            - Health check\n`);
});

module.exports = app;
