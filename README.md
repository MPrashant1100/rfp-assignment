# RFP Contract Management System

A complete RFP (Request for Proposal) contract management system built with Next.js, TypeScript, MongoDB, and Tailwind CSS.

## Features

### Core Functionality
- **User Authentication**: Registration and login with role-based access (Buyer/Supplier)
- **RFP Lifecycle Management**: Create, publish, respond, review, and approve/reject RFPs
- **File Upload**: Document upload for RFPs and responses (local storage)
- **Status Tracking**: Complete workflow from Draft → Published → Response Submitted → Under Review → Approved/Rejected
- **Email Notifications**: Simulated email notifications for status changes
- **Full-text Search**: Search RFPs and responses using MongoDB text indexes
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

### Role-Based Access
- **Buyers**: Create RFPs, publish them, review responses, approve/reject
- **Suppliers**: Browse available RFPs, submit responses, track status

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Storage**: Local file system with proper handling
- **Email**: Simulated logging (ready for SendGrid/Mailgun integration)

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rfp-assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```
   MONGODB_URI=mongodb://localhost:27017/rfp_assignment
   JWT_SECRET=your_jwt_secret_here
   EMAIL_SIMULATION=true
   ```

4. **Start MongoDB** (if using local)
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

### Buyer Account
- **Email**: buyer@test.com
- **Password**: password123
- **Role**: Buyer

### Supplier Account  
- **Email**: supplier@test.com
- **Password**: password123
- **Role**: Supplier

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### RFPs
- `GET /api/rfp` - List all RFPs
- `POST /api/rfp` - Create new RFP (Buyer only)
- `PATCH /api/rfp-status` - Update RFP status (Buyer only)

### Responses
- `GET /api/response` - List responses for an RFP
- `POST /api/response` - Submit response (Supplier only)
- `PATCH /api/response-status` - Update response status (Buyer only)

### File Upload
- `POST /api/rfp-upload` - Upload RFP document (Buyer only)
- `POST /api/response-upload` - Upload response document (Supplier only)

### Search
- `GET /api/search-rfp?q=<query>` - Search RFPs
- `GET /api/search-response?q=<query>` - Search responses

## Database Schema

### User Model
```typescript
{
  email: string (unique),
  password: string (hashed),
  role: 'Buyer' | 'Supplier',
  createdAt: Date,
  updatedAt: Date
}
```

### RFP Model
```typescript
{
  title: string,
  description: string,
  file: string (file path),
  status: 'Draft' | 'Published' | 'Under Review' | 'Approved' | 'Rejected',
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Response Model
```typescript
{
  rfp: ObjectId (ref: RFP),
  supplier: ObjectId (ref: User),
  file: string (file path),
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected',
  createdAt: Date,
  updatedAt: Date
}
```

## AI Usage Report

This project was developed with significant assistance from AI tools, demonstrating effective AI-human collaboration:

### AI-Assisted Development
- **Code Generation**: AI helped generate boilerplate code for API routes, database models, and React components
- **Architecture Design**: AI assisted in designing the database schema and API structure
- **UI/UX**: AI provided guidance on component organization and Tailwind CSS implementation
- **Error Handling**: AI helped implement comprehensive error handling and loading states
- **Documentation**: AI assisted in creating comprehensive README and API documentation

### Productivity Gains
- **Rapid Prototyping**: AI enabled quick iteration and feature development
- **Code Quality**: AI helped maintain consistent patterns and best practices
- **Problem Solving**: AI provided alternative approaches for complex features like file upload and status workflows
- **Learning**: AI explanations helped understand modern React patterns and Next.js conventions

### Quality Assurance
Despite AI assistance, all code was reviewed and tested to ensure:
- Proper TypeScript typing
- Security best practices (JWT, role-based access)
- Error handling and user feedback
- Responsive design and accessibility
- Clean, maintainable code structure

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- **Netlify**: Similar to Vercel deployment
- **Railway**: Good for full-stack apps with database
- **Heroku**: Traditional platform with good MongoDB support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Next.js, TypeScript, and AI assistance**
