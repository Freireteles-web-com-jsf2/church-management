import React, { useEffect, useState } from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';

interface SessionExpiryWarningProps {
  warningThreshold?: number; // Time in milliseconds before expiry to show warning (default: 5 minutes)
}

const SessionExpiryWarning: React.FC<SessionExpiryWarningProps> = ({ 
  warningThreshold = 5 * 60 * 1000 // 5 minutes by default
}) => {
  const { 
    sessionStatus, 
    remainingTime, 
    extendSession, 
    logout,
    isAuthenticated
  } = useLocalAuth();
  
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    // Only show warning if user is authenticated and session is expiring soon
    if (isAuthenticated && sessionStatus === 'expiring_soon' && remainingTime !== null) {
      setShowWarning(true);
      
      // Format remaining time
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      // Update time left every second
      const interval = setInterval(() => {
        if (remainingTime !== null) {
          const newRemainingTime = remainingTime - 1000;
          if (newRemainingTime <= 0) {
            clearInterval(interval);
            return;
          }
          
          const minutes = Math.floor(newRemainingTime / 60000);
          const seconds = Math.floor((newRemainingTime % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else if (sessionStatus === 'idle') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [sessionStatus, remainingTime, isAuthenticated]);
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className="session-expiry-warning">
      <div className="session-expiry-modal">
        <div className="session-expiry-content">
          <h3>
            {sessionStatus === 'idle' 
              ? 'Sessão inativa' 
              : 'Sua sessão está prestes a expirar'}
          </h3>
          
          <p>
            {sessionStatus === 'idle'
              ? 'Você está inativo há algum tempo. Deseja continuar conectado?'
              : `Sua sessão expirará em ${timeLeft}. Deseja continuar conectado?`}
          </p>
          
          <div className="session-expiry-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                extendSession();
                setShowWarning(false);
              }}
            >
              Continuar conectado
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                logout();
                setShowWarning(false);
              }}
            >
              Encerrar sessão
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .session-expiry-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .session-expiry-modal {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .session-expiry-content {
          text-align: center;
        }
        
        .session-expiry-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .btn-primary {
          background-color: #4a90e2;
          color: white;
        }
        
        .btn-secondary {
          background-color: #e0e0e0;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default SessionExpiryWarning;