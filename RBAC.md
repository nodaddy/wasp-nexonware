# Role-Based Access Control (RBAC) Documentation

## Overview

This document outlines the role-based access control (RBAC) implementation in the Nexonware Enterprise Administration Platform. The system uses Firebase Authentication with custom claims to manage user roles and access permissions.

## Roles and Permissions

The platform currently supports two roles:

1. **Admin**

   - Full access to all platform features
   - Can manage users and assign roles
   - Can access all dashboard sections

2. **Analyst**

   - Limited access to analytics and reporting features
   - Can only access the Analytics & Reporting page and Help page
   - Cannot manage users or assign roles

3. **No Role (Revoked Access)**
   - Users without a role cannot sign in to the platform
   - Access is denied with a message indicating admin privileges are required
   - Admins can revoke roles to immediately remove access

## Authentication Flow

### Sign-In Process

1. User enters email and password on the login page
2. The system authenticates the user with Firebase Authentication
3. Upon successful authentication, the system checks the user's custom claims
4. If the user has a valid role (admin or analyst), they are redirected to the appropriate page:
   - Admin users are redirected to the main dashboard
   - Analyst users are redirected directly to the Analytics & Reporting page
5. If the user does not have a valid role, they are signed out and shown an error message

### Role Verification

The role verification happens in multiple places:

1. **Client-side**: The `useAuth` hook exposes `isAdmin` and `isAnalyst` flags, as well as the `userRole` property
2. **Route protection**: The `RoleBasedRoute` component checks if the user has the required role to access a page
3. **API endpoints**: Server-side API endpoints verify the user's role before processing requests

## Access Control Implementation

### Component Structure

1. **AuthProvider**

   - Manages authentication state
   - Fetches and stores user role information
   - Provides authentication methods (signIn, signOut)

2. **RoleBasedRoute**

   - Protects routes based on user roles
   - Takes an array of allowed roles as a prop
   - Shows access denied message for unauthorized users
   - Redirects users based on their role

3. **DashboardLayout**
   - Adapts the UI based on the user's role
   - Shows different navigation items for different roles
   - Displays the user's role in the profile dropdown

### Route Protection

Each dashboard section has its own layout file that implements role-based protection:

| Section                 | Allowed Roles  | File Path                                     |
| ----------------------- | -------------- | --------------------------------------------- |
| Dashboard (main)        | admin          | src/app/dashboard/(admin)/layout.tsx          |
| User Management         | admin          | src/app/dashboard/users/layout.tsx            |
| Extension Policy        | admin          | src/app/dashboard/extension-policy/layout.tsx |
| Analytics & Reporting   | admin, analyst | src/app/dashboard/analytics/layout.tsx        |
| Settings & Integrations | admin          | src/app/dashboard/settings/layout.tsx         |
| Onboarding & Help       | admin, analyst | src/app/dashboard/help/layout.tsx             |

### API Endpoints

API endpoints that handle sensitive operations also implement role-based access control:

1. **User Search API** (`/api/users/search`)

   - Only accessible to admin users
   - Verifies the user's role before processing the request
   - Checks that the searched user belongs to the same organization (domain)

2. **Role Update API** (`/api/users/update-role`)
   - Only accessible to admin users
   - Verifies the user's role before processing the request
   - Ensures that only admin users can assign or revoke roles
   - Checks that the target user belongs to the same organization (domain)
   - Handles role revocation by removing the role claim

## Technical Implementation

### Custom Claims

User roles are stored as custom claims in Firebase Authentication. The relevant claims are:

```json
{
  "role": "admin" | "analyst",
  "companyId": "company-document-id"
}
```

- The `role` claim determines the user's access level in the system
- The `companyId` claim associates the user with their company and is used for data access control
- When a role is revoked, the `role` claim is removed from the user's custom claims, but the `companyId` remains

### Company Association

Users are associated with their company through the `companyId` claim:

1. When a company is registered, the admin user receives both the `role` and `companyId` claims
2. When an admin assigns a role to another user, the system automatically assigns the same `companyId` to that user
3. This ensures that all users within an organization share the same `companyId`
4. The `companyId` is used to restrict access to company-specific data and settings

### Role Check in Code

#### Client-side Role Check

```typescript
// Using the useAuth hook
const { isAdmin, isAnalyst, userRole } = useAuth();

// Conditional rendering based on role
{
  isAdmin && <AdminOnlyComponent />;
}
{
  isAnalyst && <AnalystComponent />;
}
```

#### Route Protection

```typescript
// Protecting a route for admin users only
<RoleBasedRoute allowedRoles={["admin"]}>
  <AdminOnlyComponent />
</RoleBasedRoute>

// Protecting a route for both admin and analyst users
<RoleBasedRoute allowedRoles={["admin", "analyst"]}>
  <SharedComponent />
</RoleBasedRoute>
```

#### Server-side Role Check

```typescript
// In API route handlers
const decodedToken = await auth.verifyIdToken(idToken);
const user = await auth.getUser(decodedToken.uid);

// Check if user is an admin
if (!user.customClaims?.role || user.customClaims.role !== "admin") {
  return NextResponse.json(
    { error: "Unauthorized. Admin privileges required." },
    { status: 403 }
  );
}
```

## User Experience

### Admin Experience

1. Admin users see all navigation items in the sidebar
2. They can access all dashboard sections
3. They can search for users and manage their roles
4. They can assign roles (admin or analyst) to users
5. They can revoke roles from users to remove their access
6. They see the "Admin" role in their profile dropdown

### Analyst Experience

1. Analyst users only see the Analytics & Reporting and Help navigation items
2. They are automatically redirected to the Analytics page after login
3. If they try to access restricted pages, they see an access denied message
4. They see the "Analyst" role in their profile dropdown

## Role Assignment and Revocation

Only admin users can assign or revoke roles. The process is:

### Assigning Roles

1. Admin navigates to the User Management page
2. Admin searches for a user by email
3. If the user is found and belongs to the same organization (domain), their details are displayed
4. Admin can click on the user's current role to edit it
5. Admin selects a new role from the dropdown (admin or analyst)
6. Upon saving, the user's custom claims are updated in Firebase:
   - The `role` claim is set to the selected role
   - The `companyId` claim is set to match the admin's company ID
7. This ensures the user has the correct role and company association

### Revoking Roles

1. Admin navigates to the User Management page
2. Admin searches for a user by email
3. Admin can revoke a role in two ways:
   - Click on the user's role, select "No Role" from the dropdown, and save
   - Click the revoke button (shield icon) next to the user's role
4. Upon confirmation, the role claim is removed from the user's custom claims
5. The user will no longer be able to sign in to the platform

## Security Considerations

1. Role checks are performed both on the client and server side
2. API endpoints verify the user's role before processing sensitive operations
3. Users can only manage other users from the same organization (domain)
4. The system prevents unauthorized access to protected routes and features
5. Role revocation provides immediate access removal for security incidents

## Future Enhancements

Potential enhancements to the RBAC system:

1. Additional roles with more granular permissions
2. Permission-based access control (PBAC) for more fine-grained control
3. Role hierarchy for inheritance of permissions
4. Audit logging for role changes and access attempts
5. Time-based or conditional access controls
6. Temporary role assignments with expiration dates
