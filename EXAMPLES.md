# Usage Examples

This document provides practical examples for testing the geofence service.

## Starting the Server

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000

Available endpoints:
  POST   /location          - Submit vehicle location
  GET    /vehicle/:id       - Get vehicle status
  GET    /zones             - List all zones
  GET    /vehicles          - List all vehicles
  GET    /health            - Health check
```

## Example 1: Vehicle Entering Downtown Zone

```bash
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-001",
    "latitude": 40.7520,
    "longitude": -73.9830
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "vehicleId": "taxi-001",
  "currentZones": ["downtown"],
  "transitions": {
    "entered": ["downtown"],
    "exited": []
  }
}
```

## Example 2: Vehicle Moving Outside All Zones

```bash
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-001",
    "latitude": 40.8000,
    "longitude": -73.9500
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "vehicleId": "taxi-001",
  "currentZones": [],
  "transitions": {
    "entered": [],
    "exited": ["downtown"]
  }
}
```

## Example 3: Vehicle Entering Airport Zone

```bash
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-002",
    "latitude": 40.6400,
    "longitude": -73.7800
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "vehicleId": "taxi-002",
  "currentZones": ["airport"],
  "transitions": {
    "entered": ["airport"],
    "exited": []
  }
}
```

## Example 4: Query Vehicle Status

```bash
curl http://localhost:3000/vehicle/taxi-001
```

**Expected Response:**
```json
{
  "vehicleId": "taxi-001",
  "latitude": 40.8000,
  "longitude": -73.9500,
  "currentZones": [],
  "lastUpdated": "2025-11-30T10:30:00.000Z"
}
```

## Example 5: List All Zones

```bash
curl http://localhost:3000/zones
```

**Expected Response:**
```json
{
  "zones": [
    {
      "id": "downtown",
      "name": "Downtown Area",
      "type": "rectangle"
    },
    {
      "id": "airport",
      "name": "Airport Zone",
      "type": "rectangle"
    },
    {
      "id": "financial_district",
      "name": "Financial District",
      "type": "rectangle"
    }
  ]
}
```

## Example 6: List All Tracked Vehicles

```bash
curl http://localhost:3000/vehicles
```

**Expected Response:**
```json
{
  "count": 2,
  "vehicles": [
    {
      "vehicleId": "taxi-001",
      "latitude": 40.8000,
      "longitude": -73.9500,
      "currentZones": [],
      "lastUpdated": "2025-11-30T10:30:00.000Z"
    },
    {
      "vehicleId": "taxi-002",
      "latitude": 40.6400,
      "longitude": -73.7800,
      "currentZones": ["airport"],
      "lastUpdated": "2025-11-30T10:31:00.000Z"
    }
  ]
}
```

## Example 7: Error - Invalid Coordinates

```bash
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-003",
    "latitude": 100,
    "longitude": -73.9830
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180"
}
```

## Example 8: Error - Missing Fields

```bash
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "taxi-004"
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required fields: vehicleId, latitude, longitude"
}
```

## Example 9: Error - Vehicle Not Found

```bash
curl http://localhost:3000/vehicle/taxi-999
```

**Expected Response:**
```json
{
  "error": "Vehicle not found",
  "vehicleId": "taxi-999"
}
```

## Complete Test Scenario

Here's a complete workflow tracking a taxi journey:

```bash
# 1. Taxi starts in downtown
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "taxi-123", "latitude": 40.7520, "longitude": -73.9830}'

# 2. Taxi moves between zones
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "taxi-123", "latitude": 40.7300, "longitude": -73.9900}'

# 3. Taxi enters financial district
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "taxi-123", "latitude": 40.7050, "longitude": -74.0100}'

# 4. Taxi exits all zones
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "taxi-123", "latitude": 40.6000, "longitude": -74.0000}'

# 5. Check final status
curl http://localhost:3000/vehicle/taxi-123
```

## Zone Coordinates Reference

For testing, here are the zone boundaries:

**Downtown Area:**
- North: 40.7589, South: 40.7489
- East: -73.9789, West: -73.9889

**Airport Zone:**
- North: 40.6500, South: 40.6300
- East: -73.7700, West: -73.7900

**Financial District:**
- North: 40.7100, South: 40.7000
- East: -74.0050, West: -74.0150

Use coordinates within these bounds to test zone entry/exit behavior.
