# Smart Leads Dashboard API Documentation

## Base URL

Local development:

```text
http://localhost:5001/api
```

Docker backend service:

```text
http://localhost:5001/api
```

## Authentication

Protected endpoints require a JWT in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

Roles:

- `admin`: can access all leads.
- `sales`: can access only leads created by that user.

## Common Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

Common status codes:

- `400`: Invalid request data
- `401`: Missing or invalid authentication token
- `403`: Insufficient permission
- `404`: Resource not found
- `409`: Duplicate email
- `500`: Server configuration or internal error

## Auth Endpoints

### POST `/api/auth/register`

Creates a user account and returns a JWT.

Request body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

`role` must be `admin` or `sales`. If omitted by backend defaults, the role is `sales`.

Success response: `201 Created`

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "665f1a2b3c4d5e6f78901234",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-05-19T10:00:00.000Z"
  }
}
```

Error example: `409 Conflict`

```json
{
  "success": false,
  "message": "Email is already registered"
}
```

### POST `/api/auth/login`

Authenticates a user and returns a JWT.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Success response: `200 OK`

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "665f1a2b3c4d5e6f78901234",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-05-19T10:00:00.000Z"
  }
}
```

Error example: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### GET `/api/auth/profile`

Returns the authenticated user's profile.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Success response: `200 OK`

```json
{
  "success": true,
  "user": {
    "id": "665f1a2b3c4d5e6f78901234",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-05-19T10:00:00.000Z"
  }
}
```

Error example: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

## Lead Endpoints

All lead endpoints are protected.

### POST `/api/leads`

Creates a lead for the authenticated user.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Request body:

```json
{
  "name": "Jane Prospect",
  "email": "jane@example.com",
  "status": "New",
  "source": "Website"
}
```

Allowed `status` values:

- `New`
- `Contacted`
- `Qualified`
- `Lost`

Allowed `source` values:

- `Website`
- `Instagram`
- `Referral`

Success response: `201 Created`

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "665f1a2b3c4d5e6f78905678",
      "name": "Jane Prospect",
      "email": "jane@example.com",
      "status": "New",
      "source": "Website",
      "createdBy": "665f1a2b3c4d5e6f78901234",
      "createdAt": "2026-05-19T10:15:00.000Z"
    }
  }
}
```

Error example: `400 Bad Request`

```json
{
  "success": false,
  "message": "A valid email is required"
}
```

### GET `/api/leads`

Returns paginated leads.

Admin users receive all matching leads. Sales users receive only their own matching leads.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Query params:

| Param | Type | Description |
| --- | --- | --- |
| `status` | string | Optional. One of `New`, `Contacted`, `Qualified`, `Lost`. |
| `source` | string | Optional. One of `Website`, `Instagram`, `Referral`. |
| `search` | string | Optional. Case-insensitive search against lead name or email. |
| `sort` | string | Optional. `latest` or `oldest`. Defaults to `latest`. |
| `page` | number | Optional. Positive integer. Defaults to `1`. |

Pagination uses a fixed limit of `10`.

Example:

```http
GET /api/leads?status=New&source=Website&search=jane&sort=latest&page=1
```

Success response: `200 OK`

```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "665f1a2b3c4d5e6f78905678",
        "name": "Jane Prospect",
        "email": "jane@example.com",
        "status": "New",
        "source": "Website",
        "createdBy": "665f1a2b3c4d5e6f78901234",
        "createdAt": "2026-05-19T10:15:00.000Z"
      }
    ],
    "pagination": {
      "totalItems": 1,
      "currentPage": 1,
      "totalPages": 1,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### GET `/api/leads/:id`

Returns one lead by ID.

Admin users can access any lead. Sales users can access only their own leads.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Success response: `200 OK`

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "665f1a2b3c4d5e6f78905678",
      "name": "Jane Prospect",
      "email": "jane@example.com",
      "status": "Contacted",
      "source": "Website",
      "createdBy": "665f1a2b3c4d5e6f78901234",
      "createdAt": "2026-05-19T10:15:00.000Z"
    }
  }
}
```

Error example: `404 Not Found`

```json
{
  "success": false,
  "message": "Lead not found"
}
```

### PUT `/api/leads/:id`

Updates a lead.

Admin users can update any lead. Sales users can update only their own leads.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Request body:

```json
{
  "name": "Jane Prospect",
  "email": "jane@example.com",
  "status": "Qualified",
  "source": "Referral"
}
```

All fields are optional for update, but at least one valid lead field is required.

Success response: `200 OK`

```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "665f1a2b3c4d5e6f78905678",
      "name": "Jane Prospect",
      "email": "jane@example.com",
      "status": "Qualified",
      "source": "Referral",
      "createdBy": "665f1a2b3c4d5e6f78901234",
      "createdAt": "2026-05-19T10:15:00.000Z"
    }
  }
}
```

### DELETE `/api/leads/:id`

Deletes a lead.

Admin users can delete any lead. Sales users can delete only their own leads.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Success response: `200 OK`

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

## CSV Export

### GET `/api/leads/export/csv`

Exports matching leads as a CSV file.

Admin users export all matching leads. Sales users export only their own matching leads.

Headers:

```http
Authorization: Bearer <jwt_token>
```

Query params:

| Param | Type | Description |
| --- | --- | --- |
| `status` | string | Optional. One of `New`, `Contacted`, `Qualified`, `Lost`. |
| `source` | string | Optional. One of `Website`, `Instagram`, `Referral`. |
| `search` | string | Optional. Case-insensitive search against lead name or email. |
| `sort` | string | Optional. `latest` or `oldest`. Defaults to `latest`. |

Example:

```http
GET /api/leads/export/csv?status=Qualified&sort=oldest
```

Success response: `200 OK`

Response headers:

```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="leads.csv"
```

CSV body:

```csv
Name,Email,Status,Source,Created At
Jane Prospect,jane@example.com,Qualified,Referral,2026-05-19T10:15:00.000Z
```

Error example: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Invalid authentication token"
}
```
