# Data Studio

A modern database management studio with introspection and query capabilities.

## Features

- 🔍 **Database Introspection**: Automatically discover and visualize your database schema
- 📊 **Table Management**: View, edit, and manage table data with pagination and sorting
- 💻 **SQL Query Interface**: Execute custom SQL queries with a modern interface
- 🎯 **CRUD Operations**: Full support for Create, Read, Update, and Delete operations
- 🎨 **Modern UI**: Built with Remix and Tailwind CSS for a beautiful, responsive experience

## Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)
- PostgreSQL database

## Project Structure

```
drizzle-server/
├── packages/
│   ├── server/           # Backend Express API
│   │   ├── src/
│   │   │   ├── db/      # Database operations and introspection
│   │   │   └── index.ts # Server entry point
│   │   └── package.json
│   └── web/             # Frontend Remix application
│       ├── app/
│       │   ├── components/  # Reusable React components
│       │   ├── routes/     # Remix routes
│       │   └── utils/      # Utility functions
│       └── package.json
├── package.json
└── pnpm-workspace.yaml
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drizzle-server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `packages/server` directory:
   ```env
   HOST=localhost
   DB_PORT=5555
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB=postgres
   PORT=3001
   ```

4. **Start the development servers**
   ```bash
   pnpm dev
   ```
   This will start both the backend server and frontend application.
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## Available Scripts

- `pnpm dev`: Start both server and client in development mode
- `pnpm build`: Build both packages for production
- `pnpm start`: Start both packages in production mode
- `pnpm test`: Run tests across all packages

## API Endpoints

### Schema
- `GET /schema`: Fetch database schema information

### Tables
- `GET /tables/:tableName/data`: Get table data with pagination and sorting
- `POST /tables/:tableName/data`: Insert new row
- `PUT /tables/:tableName/data/:id`: Update existing row
- `DELETE /tables/:tableName/data/:id`: Delete row

### Queries
- `POST /query`: Execute custom SQL query

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
