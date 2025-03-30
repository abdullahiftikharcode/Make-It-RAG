# SQL Chat Assistant

A powerful AI-powered SQL query generator that allows users to interact with their databases using natural language. Built with Next.js, FastAPI, and Google's Gemini AI.

![SQL Chat Assistant](https://via.placeholder.com/800x400?text=SQL+Chat+Assistant)

## Features

- 🤖 Natural language to SQL conversion using Google's Gemini AI
- 📊 Interactive database schema visualization
- 💬 Real-time chat interface for database queries
- 🔄 Chat history management and persistence
- 🌓 Dark/Light mode support
- 🔒 Secure authentication and session management
- ⚙️ Customizable user settings
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Framer Motion

### Backend
- FastAPI
- Python
- SQLAlchemy
- Google Gemini AI
- JWT Authentication

### Database
- MySQL/PostgreSQL/SQL Server support
- Optimized schema design
- Query logging and monitoring

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MySQL/PostgreSQL/SQL Server
- Google Cloud API key for Gemini AI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sql-chat-assistant.git
cd sql-chat-assistant
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# server/.env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

5. Start the development servers:
```bash
# Terminal 1 - Frontend
cd client
npm run dev

# Terminal 2 - Backend
cd server
uvicorn main:app --reload
```

## Project Structure

```
sql-chat-assistant/
├── client/                 # Frontend Next.js application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── public/           # Static assets
├── server/               # Backend FastAPI application
│   ├── text_to_sql.py    # Core SQL generation logic
│   └── main.py          # FastAPI application
└── database/            # Database migrations and schema
```

## Key Features in Detail

### Natural Language to SQL
- Powered by Google's Gemini AI
- Context-aware query generation
- Query validation and verification
- Support for multiple SQL dialects

### Database Schema Visualization
- Interactive schema browser
- Table relationships visualization
- Column details and constraints
- Real-time schema updates

### Chat Interface
- Real-time message updates
- SQL query display toggle
- Code syntax highlighting
- Message history persistence

### Security
- JWT-based authentication
- Password hashing
- Session management
- API key management
- Two-factor authentication support

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `PUT /api/change-password` - Password update

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat-sessions` - Get chat history
- `GET /api/chat-sessions/:id` - Get specific chat session

### Database
- `GET /api/schema/:connectionId` - Get database schema
- `GET /api/connections` - Get user's database connections
- `POST /api/connections` - Add new database connection

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for natural language processing
- Next.js team for the amazing framework
- FastAPI team for the high-performance API framework
- All contributors and users of this project

## Support

For support, email support@sqlchatapp.com or join our Slack channel.

---

Made with ❤️ by [Your Name/Organization] 