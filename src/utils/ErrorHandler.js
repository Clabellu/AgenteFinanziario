// src/utils/ErrorHandler.js
class ErrorHandler {
    static handleAPIError(error, fallbackAction) {
      console.error('API Error:', error);
      
      // Categorizza gli errori
      if (error.code === 'ECONNREFUSED') {
        return { type: 'connection', message: 'Impossibile connettersi al servizio.' };
      } else if (error.response && error.response.status === 401) {
        return { type: 'auth', message: 'Errore di autenticazione API.' };
      }
      
      // Fallback generico
      return { 
        type: 'generic', 
        message: 'Si è verificato un errore imprevisto.',
        details: error.message,
        fallback: fallbackAction 
      };
    }
    
    static showUserError(errorInfo) {
      // Implementazione UI per mostrare errori all'utente
    }
  }
  
  export default ErrorHandler;