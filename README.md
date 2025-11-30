# Geofence Event Processing Service

A location-based tracking service for managing vehicle movements through geographic zones. The system processes real-time GPS coordinates and detects zone boundary crossings.

## Features

- **Real-time Location Tracking**: Accept GPS coordinates via HTTP endpoint
- **Zone Crossing Detection**: Automatically detect when vehicles enter or exit zones
- **Vehicle Status Query**: Check current zone status for any vehicle
- **Structured Logging**: JSON-formatted logs for monitoring and debugging
- **Error Handling**: Comprehensive validation and error responses

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Service

```bash
# Production mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Submit Location Event

**POST** `/location`

Submit a vehicle's GPS coordinates.

**Request Body:**
```json
{
  "vehicleId": "taxi-123",
  "latitude": 40.7589,
  "longitude": -73.9851
}
```

**Response:**
```json
{
  "success": true,
  "vehicleId": "taxi-123",
  "currentZones": ["downtown"],
  "transitions": {
    "entered": ["downtown"],
    "exited": []
  }
}
```

### 2. Get Vehicle Status

**GET** `/vehicle/:vehicleId`

Query the current zone status for a specific vehicle.

**Response:**
```json
{
  "vehicleId": "taxi-123",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "currentZones": ["downtown"],
  "lastUpdated": "2025-11-30T10:30:00.000Z"
}
```

### 3. List All Zones

**GET** `/zones`

Get all available geographic zones.

**Response:**
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
    }
  ]
}
```

### 4. List All Vehicles

**GET** `/vehicles`

Get all tracked vehicles (useful for monitoring).

**Response:**
```json
{
  "count": 2,
  "vehicles": [
    {
      "vehicleId": "taxi-123",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "currentZones": ["downtown"],
      "lastUpdated": "2025-11-30T10:30:00.000Z"
    }
  ]
}
```

### 5. Health Check

**GET** `/health`

Check service health.

## Architecture & Design Decisions

### 1. Technology Stack

**Choice:** Node.js with Express

**Reasoning:**
- Fast development for MVP
- Non-blocking I/O ideal for handling many location updates
- Lightweight and simple to deploy
- Easy to add WebSocket support later for real-time notifications

### 2. Zone Representation

**Choice:** Rectangular boundaries (bounding boxes)

**Reasoning:**
- O(1) point-in-rectangle check (simple comparison)
- Easy to define and visualize
- Sufficient for most real-world use cases
- Could extend to polygons later if needed

**Trade-off:** Less precise than complex polygons, but much faster and simpler to implement within time constraint.

### 3. Storage

**Choice:** In-memory Map for vehicle states

**Reasoning:**
- Fast lookups and updates (O(1))
- Simple implementation for MVP
- No external dependencies for demo

**Production Alternative:** Redis for persistence and horizontal scaling, or PostgreSQL with PostGIS for complex queries.

### 4. Zone Transition Detection

**Approach:** Compare previous zones with current zones using Set operations

**Benefits:**
- Clear, readable logic
- Handles multiple zone overlaps correctly
- Easy to test and debug

### 5. Error Handling

**Implemented:**
- Input validation (coordinates, required fields)
- Try-catch blocks around all endpoints
- Structured error responses
- Detailed logging for debugging

### 6. Logging Strategy

**Format:** JSON-structured logs

**Benefits:**
- Easy to parse and aggregate in production (e.g., with ELK stack)
- Contains context (vehicleId, coordinates, transitions)
- Separate log levels (INFO, WARN, ERROR)

## Edge Cases Handled

1. **Invalid Coordinates**: Validates latitude (-90 to 90) and longitude (-180 to 180)
2. **Missing Fields**: Returns clear error for missing vehicleId or coordinates
3. **First Location Update**: Handles vehicles with no previous state
4. **Multiple Zones**: Vehicle can be in multiple overlapping zones
5. **Vehicle Not Found**: Returns 404 for unknown vehicle queries
6. **Malformed JSON**: Express handles with 400 error

## Performance Considerations

### Current Implementation
- **Zone Detection**: O(n) where n = number of zones (currently 3)
- **State Lookup**: O(1) with Map
- **Memory**: Grows with number of vehicles tracked

### Scalability Improvements for Production

1. **Spatial Indexing**: Use R-tree or quadtree for zone lookups when zones > 100
2. **Database**: Replace in-memory storage with Redis or PostgreSQL
3. **Caching**: Cache zone queries for frequently-accessed areas
4. **Rate Limiting**: Prevent abuse of location endpoint
5. **Horizontal Scaling**: Stateless design allows load balancing
6. **Message Queue**: Use Kafka/RabbitMQ for high-volume event processing

## Monitoring & Observability

### Current Logging
- All zone enter/exit events logged
- Request/response logging
- Error tracking with stack traces

### Production Additions
- Metrics: Location events/sec, zone transitions/sec, API latency
- Alerting: High error rates, unusual patterns
- Distributed tracing: For multi-service debugging
- Dashboards: Real-time vehicle heatmaps

## Testing Recommendations

### Unit Tests
- Zone detection logic
- Transition detection
- Coordinate validation

### Integration Tests
- Full API endpoint workflows
- Error scenarios
- Concurrent location updates

### Load Tests
- Simulate 1000+ vehicles updating every 5 seconds
- Measure latency and throughput

## Future Enhancements

1. **Polygon Zones**: Support complex zone shapes using point-in-polygon algorithms
2. **Circular Zones**: Add radius-based zones for airports, stadiums
3. **Zone Events**: Webhooks or WebSockets for real-time notifications
4. **Historical Data**: Store location history for analytics
5. **Time-based Zones**: Zones active only during certain hours (e.g., school zones)
6. **Vehicle Metadata**: Track driver info, passenger count, etc.
7. **Authentication**: API keys or JWT for secure access
8. **Rate Limiting**: Throttle requests per vehicle

## Assumptions

1. GPS coordinates are accurate and already validated by vehicle hardware
2. Location updates arrive in chronological order (no late arrivals)
3. Zones don't change frequently (static configuration)
4. Service restarts are acceptable (in-memory data loss)
5. No authentication needed for MVP
6. New York City coordinate system (can be adjusted)

## Project Structure

```
geofence-tracker/
├── src/
│   ├── server.js           # Express app and endpoints
│   ├── zones.js            # Zone definitions and detection logic
│   ├── vehicleTracker.js   # Vehicle state management
│   └── logger.js           # Logging utility
├── package.json
├── .gitignore
└── README.md
```

## License

MIT
