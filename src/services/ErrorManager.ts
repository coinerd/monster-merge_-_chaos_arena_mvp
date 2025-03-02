/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error data interface
 */
export interface ErrorData {
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  data?: any;
  handled: boolean;
}

/**
 * Error observer interface
 */
export interface ErrorObserver {
  onError(error: ErrorData): void;
}

/**
 * ErrorManager class that provides centralized error handling
 * - Implements the Singleton pattern for global error management
 * - Uses the Observer pattern for error notifications
 * - Provides error throttling and grouping
 * - Includes error recovery mechanisms
 */
export class ErrorManager {
  private static instance: ErrorManager;
  private observers: ErrorObserver[] = [];
  private errors: ErrorData[] = [];
  private errorThrottleMap: Map<string, number> = new Map();
  private errorThrottleMs: number = 1000; // Throttle similar errors
  private maxErrors: number = 100; // Maximum number of errors to store
  
  /**
   * Private constructor to enforce Singleton pattern
   */
  private constructor() {}
  
  /**
   * Gets the singleton instance
   */
  public static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }
  
  /**
   * Reports an error
   * @param message Error message
   * @param severity Error severity
   * @param data Additional error data
   * @returns True if the error was reported, false if it was throttled
   */
  public reportError(message: string, severity: ErrorSeverity = ErrorSeverity.ERROR, data?: any): boolean {
    try {
      // Check if this error should be throttled
      if (this.shouldThrottleError(message, severity)) {
        return false;
      }
      
      // Create error data
      const errorData: ErrorData = {
        message,
        severity,
        timestamp: Date.now(),
        data,
        handled: false
      };
      
      // Add to errors list
      this.addError(errorData);
      
      // Notify observers
      this.notifyObservers(errorData);
      
      // Log to console based on severity
      this.logToConsole(errorData);
      
      return true;
    } catch (e) {
      // Fallback to console if error handling fails
      console.error("Error in error handling:", e);
      console.error("Original error:", message, data);
      return false;
    }
  }
  
  /**
   * Adds an observer to be notified of errors
   */
  public addObserver(observer: ErrorObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }
  
  /**
   * Removes an observer
   */
  public removeObserver(observer: ErrorObserver): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  /**
   * Gets all errors
   */
  public getErrors(): ErrorData[] {
    return [...this.errors];
  }
  
  /**
   * Gets errors by severity
   */
  public getErrorsBySeverity(severity: ErrorSeverity): ErrorData[] {
    return this.errors.filter(error => error.severity === severity);
  }
  
  /**
   * Clears all errors
   */
  public clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Marks an error as handled
   */
  public markErrorAsHandled(timestamp: number): void {
    const error = this.errors.find(e => e.timestamp === timestamp);
    if (error) {
      error.handled = true;
    }
  }
  
  /**
   * Checks if an error should be throttled
   */
  private shouldThrottleError(message: string, severity: ErrorSeverity): boolean {
    // Critical errors are never throttled
    if (severity === ErrorSeverity.CRITICAL) {
      return false;
    }
    
    // Create a key for this error type
    const errorKey = `${severity}:${message}`;
    
    // Check if we've seen this error recently
    const lastTime = this.errorThrottleMap.get(errorKey);
    const now = Date.now();
    
    if (lastTime && now - lastTime < this.errorThrottleMs) {
      return true; // Throttle this error
    }
    
    // Update the last time we saw this error
    this.errorThrottleMap.set(errorKey, now);
    
    // Clean up old entries in the throttle map
    this.cleanupThrottleMap();
    
    return false;
  }
  
  /**
   * Cleans up old entries in the throttle map
   */
  private cleanupThrottleMap(): void {
    const now = Date.now();
    for (const [key, time] of this.errorThrottleMap.entries()) {
      if (now - time > this.errorThrottleMs * 10) {
        this.errorThrottleMap.delete(key);
      }
    }
  }
  
  /**
   * Adds an error to the errors list
   */
  private addError(error: ErrorData): void {
    this.errors.push(error);
    
    // Limit the number of errors we store
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }
  
  /**
   * Notifies all observers of an error
   */
  private notifyObservers(error: ErrorData): void {
    for (const observer of this.observers) {
      try {
        observer.onError(error);
      } catch (e) {
        console.error("Error notifying observer:", e);
      }
    }
  }
  
  /**
   * Logs an error to the console
   */
  private logToConsole(error: ErrorData): void {
    const { message, severity, data } = error;
    
    switch (severity) {
      case ErrorSeverity.INFO:
        console.info(message, data);
        break;
      case ErrorSeverity.WARNING:
        console.warn(message, data);
        break;
      case ErrorSeverity.ERROR:
        console.error(message, data);
        break;
      case ErrorSeverity.CRITICAL:
        console.error(`CRITICAL ERROR: ${message}`, data);
        break;
    }
  }
}
