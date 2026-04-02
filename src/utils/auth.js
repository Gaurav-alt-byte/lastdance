/**
 * Check if user is authenticated
 * @param {object} user - User object from context
 * @returns {boolean} True if user exists
 */
export const isAuthenticated = (user) => {
  return !!user && !!user._id;
};

/**
 * Get authorization headers for API requests
 * @param {string} token - JWT token (optional, can use cookies instead)
 * @returns {object} Headers object
 */
export const getAuthHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Check if user is channel owner
 * @param {string} userId - Current user ID
 * @param {string} channelOwnerId - Channel owner ID
 * @returns {boolean} True if user owns the channel
 */
export const isChannelOwner = (userId, channelOwnerId) => {
  return userId === channelOwnerId;
};

/**
 * Check if current user owns a piece of content
 * @param {string} userId - Current user ID
 * @param {string} contentOwnerId - Content owner ID
 * @returns {boolean} True if user owns the content
 */
export const isContentOwner = (userId, contentOwnerId) => {
  return userId === contentOwnerId;
};
