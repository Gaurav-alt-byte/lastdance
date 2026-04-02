/**
 * Handle API errors and extract error messages
 * @param {error} error - Error object from API or try-catch
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An error occurred. Please try again.";
};

export const isApiSuccess = (response) => {
  if (!response || typeof response !== "object") {
    return false;
  }

  if (typeof response.success === "boolean") {
    return response.success;
  }

  if (typeof response.sucess === "boolean") {
    return response.sucess;
  }

  return false;
};

export const getApiMessage = (response, fallbackMessage = "Request failed") => {
  if (typeof response?.message === "string" && response.message.trim()) {
    return response.message;
  }
  return fallbackMessage;
};

/**
 * Debounce function to limit function calls during rapid events
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function to limit function calls frequency
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID for components
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Safe JSON stringify
 * @param {*} obj - Object to stringify
 * @returns {string} JSON string
 */
export const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return "{}";
  }
};

/**
 * Safe JSON parse
 * @param {string} str - JSON string to parse
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed object or default value
 */
export const safeParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  if (typeof obj === "string") return obj.trim().length === 0;
  return false;
};

/**
 * Clone object deeply
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
