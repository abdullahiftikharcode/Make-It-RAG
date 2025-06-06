// API configuration
const config = {
  // Get the backend URL from environment variable, fallback to localhost for development
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://make-it-rag-1.onrender.com',
  
  // Helper function to get full API URL
  getApiUrl: (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://make-it-rag-1.onrender.com';
    return `${baseUrl}${path}`;
  }
};

export default config; 