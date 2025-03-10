# Invite-Only Company Registration Implementation

## Overview

We've implemented an invite-only company registration system for the Enterprise Administration Platform. This system ensures that only authorized companies can register on the platform, preventing unauthorized access and company impersonation.

## Key Components

### 1. Invite System

- Invites are manually added to the firebaes document via firebase console, for now!
- **Invite Data Structure**: Each invite includes a unique code, allowed email domains, status (active/used/expired), creation and expiration dates.
- **Invite Validation**: The system validates invites before allowing registration, checking for expiration and domain restrictions.

### 2. Registration Process

- **Invite-Based Registration**: Users must provide a valid invite code to register a company.
- **Domain Validation**: The system validates that the admin's email domain matches the allowed domains in the invite.
- **Email Domain Extraction**: The system automatically extracts the domain from the admin's email and uses it as the default company domain.
- **Multiple Domains Support**: Companies can have multiple email domains associated with them.

### 3. User Interface

- **Informative UI**: The registration page provides clear feedback at every step, showing invite validation status, allowed domains, and expiration dates.
- **Landing Page**: Updated to explain the invite-only registration process and how employees can join.

### 4. API Endpoints

- **Invite Validation API**: Validates invite codes and returns invite details.
- **Company Registration API**: Updated to require and validate invite codes during registration.

## Data Structure

### Invites Collection

```
/invites/{inviteId}/
  - code: string (unique invite code)
  - allowedDomains: string[] (email domains allowed to use this invite)
  - status: string ('active', 'used', 'expired')
  - createdAt: timestamp
  - expiresAt: timestamp
  - usedBy: string (email of user who used the invite, if used)
  - usedAt: timestamp (when the invite was used)
  - updatedAt: timestamp
```

### Companies Collection

```
/companies/{companyId}/
  - name: string
  - adminEmail: string
  - adminName: string
  - emailDomains: string[] (domains associated with this company)
  - inviteId: string (reference to the invite used)
  - inviteCode: string (the invite code used)
  - verificationToken: string
  - verificationExpiry: timestamp
  - status: string ('pending', 'active', 'suspended')
  - createdAt: timestamp
  - updatedAt: timestamp
```

## User Flow

### Company Registration

1. Admin receives an invite link with a unique code
2. Admin clicks the link and is directed to the registration page
3. System validates the invite code and displays allowed domains
4. Admin completes the registration form with company details
5. System extracts the domain from the admin's email and adds it to the company's email domains
6. Upon submission, the system:
   - Validates the invite code again
   - Checks that the admin's email domain is allowed
   - Creates the company record with email domains
   - Marks the invite as used
   - Sends a verification email to the admin

### Employee Onboarding

1. Employees register using their company email via the chrome extension
2. The system automatically associates them with their company based on their email domain
3. No additional invites are needed for employees

## Security Considerations

- Invites expire after a configurable period
- Invites can only be used once
- Email domain validation ensures only authorized domains can register

## Note on Invite Creation

Invites are created directly in the Firebase console with the following structure:

- Unique code
- List of allowed email domains
- Active status
- Expiration date
