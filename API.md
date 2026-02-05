# Fleet Manager API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT token.

**Authorization Header:**
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "id": 1,
  "name": "Example",
  "...": "..."
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### POST /auth/login
Login user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@fleetmanager.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@fleetmanager.com",
    "role": "Admin"
  }
}
```

### POST /auth/register
Register new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "Driver"
}
```

**Response:** Same as login

### GET /auth/me
Get current authenticated user information.

**Response:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@fleetmanager.com",
  "role": "Admin",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Vehicle Endpoints

### GET /vehicles
List all vehicles in the fleet.

**Response:**
```json
[
  {
    "id": 1,
    "vin": "1HGCM82633A123456",
    "make": "Honda",
    "model": "Accord",
    "year": 2023,
    "status": "Active",
    "current_mileage": 15000,
    "license_plate": "ABC-1234",
    "assigned_driver_id": 3,
    "driver_name": "Jane Driver",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### GET /vehicles/:id
Get specific vehicle by ID.

**URL Parameters:**
- `id` - Vehicle ID

**Response:** Single vehicle object

### GET /vehicles/vin/:vin
Get vehicle by VIN number.

**URL Parameters:**
- `vin` - 17-character VIN

**Response:** Single vehicle object

### POST /vehicles
Create new vehicle. Requires Admin or Technician role.

**Request Body:**
```json
{
  "vin": "1HGCM82633A123456",
  "make": "Honda",
  "model": "Accord",
  "year": 2023,
  "license_plate": "ABC-1234",
  "assigned_driver_id": 3
}
```

**Response:** Created vehicle object

### PATCH /vehicles/:id
Update existing vehicle. Requires Admin or Technician role.

**Request Body:** (all fields optional)
```json
{
  "status": "Maintenance",
  "current_mileage": 16000,
  "assigned_driver_id": 4
}
```

**Response:** Updated vehicle object

### GET /vehicles/:id/maintenance-history
Get complete maintenance history for a vehicle.

**Response:**
```json
[
  {
    "ticket_id": 1,
    "category": "Engine",
    "description": "Check engine light",
    "reported_at": "2024-01-15T10:30:00Z",
    "started_at": "2024-01-15T11:00:00Z",
    "completed_at": "2024-01-15T13:30:00Z",
    "total_labor_hours": 2.5,
    "technician_name": "John Tech",
    "total_parts_cost": 125.50
  }
]
```

---

## Ticket Endpoints

### GET /tickets
List tickets with optional filters.

**Query Parameters:**
- `status` - Filter by status (Open, In Progress, Closed)
- `vehicle_id` - Filter by vehicle ID
- `start_date` - Filter by date range start (ISO format)
- `end_date` - Filter by date range end (ISO format)

**Example:**
```
GET /tickets?status=Open&vehicle_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "vehicle_id": 1,
    "vin": "1HGCM82633A123456",
    "make": "Honda",
    "model": "Accord",
    "year": 2023,
    "submitted_by": 3,
    "submitted_by_name": "Jane Driver",
    "status": "Open",
    "priority": "High",
    "category": "Engine",
    "description": "Check engine light is on",
    "photo_url": null,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### GET /tickets/:id
Get specific ticket with full details.

**Response:**
```json
{
  "id": 1,
  "vehicle_id": 1,
  "vin": "1HGCM82633A123456",
  "make": "Honda",
  "model": "Accord",
  "submitted_by": 3,
  "submitted_by_name": "Jane Driver",
  "submitted_by_email": "driver@example.com",
  "status": "In Progress",
  "priority": "High",
  "category": "Engine",
  "description": "Check engine light is on",
  "photo_url": "https://...",
  "work_order_id": 1,
  "work_order_status": "In Progress",
  "started_at": "2024-01-15T11:00:00Z",
  "technician_name": "John Tech",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### POST /tickets
Create new maintenance ticket.

**Request Body:**
```json
{
  "vehicle_id": 1,
  "submitted_by": 3,
  "category": "Engine",
  "description": "Check engine light is on. No unusual sounds or performance issues.",
  "priority": "High",
  "photo_url": "https://..."
}
```

**Response:** Created ticket object

### PATCH /tickets/:id/status
Update ticket status. Requires Admin or Technician role.

**Request Body:**
```json
{
  "status": "Closed"
}
```

**Response:** Updated ticket object

### GET /tickets/statistics
Get ticket statistics for a date range.

**Query Parameters:**
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)

**Response:**
```json
{
  "total_tickets": 50,
  "open_tickets": 10,
  "in_progress_tickets": 8,
  "closed_tickets": 32,
  "critical_tickets": 3
}
```

---

## Work Order Endpoints

### GET /work-orders
List work orders with optional filters.

**Query Parameters:**
- `status` - Filter by status (Pending, In Progress, Completed, Cancelled)
- `technician_id` - Filter by assigned technician

**Response:**
```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "ticket_category": "Engine",
    "ticket_description": "Check engine light",
    "assigned_technician_id": 2,
    "technician_name": "John Tech",
    "status": "In Progress",
    "started_at": "2024-01-15T11:00:00Z",
    "completed_at": null,
    "total_labor_hours": null,
    "vin": "1HGCM82633A123456",
    "make": "Honda",
    "model": "Accord"
  }
]
```

### GET /work-orders/:id
Get specific work order with repair items.

**Response:**
```json
{
  "id": 1,
  "ticket_id": 1,
  "category": "Engine",
  "ticket_description": "Check engine light",
  "vehicle_id": 1,
  "vin": "1HGCM82633A123456",
  "make": "Honda",
  "model": "Accord",
  "assigned_technician_id": 2,
  "technician_name": "John Tech",
  "technician_email": "tech@example.com",
  "status": "In Progress",
  "started_at": "2024-01-15T11:00:00Z",
  "notes": "Diagnostic scan in progress"
}
```

### POST /work-orders
Create new work order. Requires Admin or Technician role.

**Request Body:**
```json
{
  "ticket_id": 1,
  "assigned_technician_id": 2,
  "notes": "Initial diagnostic required"
}
```

**Response:** Created work order object

### POST /work-orders/:id/start
Start work on a work order. Requires Admin or Technician role.

**Response:** Updated work order with `started_at` timestamp

### POST /work-orders/:id/complete
Complete a work order. Requires Admin or Technician role.

**Request Body:**
```json
{
  "labor_hours": 2.5
}
```

**Response:** Updated work order with completion details

### POST /work-orders/:id/repair-items
Add repair item to work order. Requires Admin or Technician role.

**Request Body:**
```json
{
  "category": "Engine",
  "part_name": "Oxygen Sensor",
  "part_number": "OS-1234-ABC",
  "parts_cost": 85.99,
  "quantity": 1,
  "notes": "Bank 1 Sensor 2"
}
```

**Response:** Created repair item object

### GET /work-orders/:id/repair-items
Get all repair items for a work order.

**Response:**
```json
[
  {
    "id": 1,
    "work_order_id": 1,
    "category": "Engine",
    "part_name": "Oxygen Sensor",
    "part_number": "OS-1234-ABC",
    "parts_cost": 85.99,
    "quantity": 1,
    "notes": "Bank 1 Sensor 2",
    "created_at": "2024-01-15T12:00:00Z"
  }
]
```

---

## Reports & Analytics Endpoints

### GET /reports/dashboard-summary
Get key metrics for dashboard.

**Response:**
```json
{
  "active_vehicles": 25,
  "open_tickets": 12,
  "active_repairs": 5,
  "vehicles_in_maintenance": 3,
  "critical_issues": 2,
  "total_hours_last_month": 187.5,
  "total_parts_cost_last_month": 3250.75
}
```

### GET /reports/common-repairs
Get most common repairs by category.

**Query Parameters:**
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)
- `limit` - Max results (default: 10)

**Response:**
```json
[
  {
    "category": "Brakes",
    "occurrence_count": 15,
    "total_cost": 2250.00,
    "avg_cost_per_repair": 150.00,
    "unique_tickets": 15
  }
]
```

### GET /reports/repair-time-by-vehicle
Get repair time analysis by vehicle.

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date

**Response:**
```json
[
  {
    "vehicle_id": 1,
    "vin": "1HGCM82633A123456",
    "make": "Honda",
    "model": "Accord",
    "year": 2023,
    "total_work_orders": 5,
    "total_hours": 12.5,
    "avg_hours_per_repair": 2.5,
    "total_parts_cost": 625.50
  }
]
```

### GET /reports/repair-time-by-technician
Get repair time analysis by technician.

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date

**Response:**
```json
[
  {
    "technician_id": 2,
    "technician_name": "John Tech",
    "total_work_orders": 20,
    "total_hours": 50.5,
    "avg_hours_per_repair": 2.525,
    "completed_orders": 18,
    "in_progress_orders": 2
  }
]
```

### GET /reports/vehicle-status-distribution
Get fleet status breakdown.

**Response:**
```json
[
  {
    "status": "Active",
    "count": 22,
    "percentage": 73.33
  },
  {
    "status": "Maintenance",
    "count": 5,
    "percentage": 16.67
  },
  {
    "status": "Retired",
    "count": 3,
    "percentage": 10.00
  }
]
```

### GET /reports/ticket-trends
Get ticket trends over time.

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date
- `interval` - Grouping interval (day or month)

**Response:**
```json
[
  {
    "period": "2024-01-15",
    "total_tickets": 5,
    "open_tickets": 2,
    "in_progress_tickets": 1,
    "closed_tickets": 2,
    "critical_tickets": 1
  }
]
```

### GET /reports/cost-analysis
Get cost breakdown by category.

**Query Parameters:**
- `start_date` - Start date
- `end_date` - End date

**Response:**
```json
[
  {
    "category": "Engine",
    "repair_count": 8,
    "total_parts_cost": 1250.00,
    "avg_parts_cost": 156.25,
    "total_labor_hours": 20.5,
    "estimated_labor_cost": 1537.50
  }
]
```

### GET /reports/fleet-health-score
Get overall fleet health score (0-100).

**Response:**
```json
{
  "total_vehicles": 30,
  "active_vehicles": 25,
  "maintenance_vehicles": 5,
  "open_tickets": 8,
  "health_score": 78.67
}
```

---

## Export Endpoints

### GET /reports/export/maintenance-log
Export maintenance log as CSV or PDF. Requires Admin or Technician role.

**Query Parameters:**
- `format` - Export format (csv or pdf) **required**
- `start_date` - Start date
- `end_date` - End date
- `vehicle_id` - Filter by specific vehicle

**Example:**
```
GET /reports/export/maintenance-log?format=csv&vehicle_id=1
```

**Response:** File download (CSV or PDF)

### GET /reports/export/repair-analytics
Export repair analytics as CSV. Requires Admin or Technician role.

**Query Parameters:**
- `format` - Must be "csv" **required**
- `start_date` - Start date
- `end_date` - End date

**Example:**
```
GET /reports/export/repair-analytics?format=csv
```

**Response:** CSV file download

---

## User Endpoints

### GET /users
List all users. Requires Admin role.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@fleetmanager.com",
    "role": "Admin",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /users/technicians
List all technicians.

**Response:** Array of user objects with role "Technician"

### GET /users/drivers
List all drivers.

**Response:** Array of user objects with role "Driver"

---

## Error Codes

| Error | Description |
|-------|-------------|
| AUTH_REQUIRED | No authentication token provided |
| INVALID_TOKEN | Token is invalid or expired |
| INSUFFICIENT_PERMISSIONS | User doesn't have required role |
| VALIDATION_ERROR | Request data validation failed |
| NOT_FOUND | Resource not found |
| DUPLICATE_VIN | VIN already exists |
| DUPLICATE_EMAIL | Email already in use |

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Specific limits for export endpoints

---

## WebSocket Events (Future)

Coming soon:
- `ticket:created` - New ticket submitted
- `ticket:updated` - Ticket status changed
- `work_order:started` - Work order started
- `work_order:completed` - Work order completed

---

Need help? Check the [README](README.md) or [Quick Start Guide](QUICKSTART.md).
