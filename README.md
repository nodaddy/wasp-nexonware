# Nexonware Enterprise Administration Platform (EAP)

A comprehensive platform for enterprise administration, allowing companies to register, manage users, and access various administrative features.

## Features

- Company registration and onboarding
- Admin account setup with secure password creation
- Email verification using Firebase Authentication
- User authentication with Firebase and role-based access control
- Responsive and professional UI
- Email notification system for subscription and invite requests

## Architecture

The application follows a server-centric approach:

- **Client-side**: Minimal Firebase usage, only for authentication state
- **Server-side**: Firebase Admin SDK for all data operations and user management
- **API Routes**: Next.js API routes for secure server-side operations
- **Authentication**: Custom claims for role-based access control and company association

## Documentation

- **[RBAC.md](./RBAC.md)**: Details on the role-based access control implementation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: API endpoint documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**: Overview of implementation details
- **[TYPESCRIPT-MIGRATION.md](./TYPESCRIPT-MIGRATION.md)**: TypeScript migration notes
- **[docs/email-notification-implementation.md](./docs/email-notification-implementation.md)**: Email notification system implementation

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Firebase Authentication with Custom Claims for roles
- Firestore Database
- Tailwind CSS
- React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account with a project set up

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Realtime Database (start in test mode)
4. Create a web app in your Firebase project to get your configuration
5. Create a `.env.local` file in the root of the project with the following variables:

```
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Firebase Admin Configuration (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

6. For the admin configuration, you'll need to generate a private key from the Firebase console:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file and use the values in your `.env.local` file

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (you'll need to add these values from your service account JSON)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Content\n-----END PRIVATE KEY-----\n"

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

The application uses Firebase Authentication custom claims to implement role-based access control:

- **Admin**: Company administrators who can manage their company settings and users
- Additional roles can be added as needed

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and Firebase setup
- `/src/app/api` - API routes for server-side operations
- `/src/hooks` - Custom React hooks including authentication
- `/src/types` - TypeScript type definitions and interfaces

## Security

- All sensitive operations are performed server-side via API routes
- Firebase Admin SDK is only used on the server
- Client-side Firebase is limited to authentication state
- JWT tokens are verified on the server for each API request
- Custom claims are used for role-based access control

## Deployment

This application can be deployed on Vercel or any other hosting platform that supports Next.js applications.

## License

This project is licensed under the MIT License.

## Data Structure

The Realtime Database follows this structure:

```
metrics/
  ├── companyId/
  │   ├── userId/
  │   │   ├── clipboardEvents/
  │   │   │   ├── timestamp1: { event data }
  │   │   │   └── timestamp2: { event data }
  │   │   ├── fileDownloads/
  │   │   │   ├── timestamp1: { download data }
  │   │   │   └── timestamp2: { download data }
  │   │   ├── fileUploads/
  │   │   │   ├── timestamp1: { upload data }
  │   │   │   └── timestamp2: { upload data }
  │   │   └── urls/
  │   │       ├── timestamp1: { visit data }
  │   │       └── timestamp2: { visit data }
  │   └── userId2/
  │       └── ...
  └── companyId2/
      └── ...
```

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
