export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
  };
  
  export const PERFORMANCE_RATINGS = {
    EXCEEDS_EXPECTATIONS: 5,
    ABOVE_EXPECTATIONS: 4,
    MEETS_EXPECTATIONS: 3,
    BELOW_EXPECTATIONS: 2,
    POOR: 1,
  };
  
  export const HTTP_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
  };
  
  export const PAGINATION = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  };
  
  export const SECURITY = {
    JWT_EXPIRY: '7d',
    PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour in ms
  };  