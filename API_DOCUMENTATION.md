# API Documentation

This document provides detailed information about the API endpoints available in the Nexonware Enterprise Administration Platform.

## Authentication

All API endpoints require authentication using Firebase Authentication. The client should include an ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## User Management APIs

### Update User Role

Updates a user's role and assigns the company ID.

**Endpoint:** `POST /api/users/update-role`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "uid": "firebase-user-id",
  "role": "admin" | "analyst" | null
}
```

- `uid`: The Firebase UID of the user whose role is being updated
- `role`: The new role to assign to the user. Use `null` to revoke the role.

**Response:**

```json
{
  "success": true,
  "message": "User role updated to admin",
  "companyIdAssigned": true,
  "companyId": "company-document-id"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: The requesting user is not an admin
- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: User not found

**Notes:**

1. Only users with the `admin` role can update roles
2. The admin can only update users from the same organization (domain)
3. When a role is assigned, the user automatically receives the same `companyId` as the admin
4. When a role is revoked (by setting it to `null`), the `role` claim is removed but the `companyId` claim remains
5. The `companyId` is used for data access control throughout the application

**Example:**

```javascript
// Example request to update a user's role
const response = await fetch("/api/users/update-role", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({
    uid: "user123",
    role: "analyst",
  }),
});

const data = await response.json();
// data = {
//   success: true,
//   message: "User role updated to analyst",
//   companyIdAssigned: true,
//   companyId: "company123"
// }
```

## Company Data Access

The `companyId` claim is used throughout the application to restrict data access to company-specific resources:

1. When fetching company data, the system verifies that the user's `companyId` matches the requested company
2. When updating company settings, the system ensures the user belongs to that company
3. Analytics and metrics are filtered by the user's `companyId`

This ensures that users can only access data from their own company, even if they have the same role level as users in other companies.
