/**
 * Safely extracts a URI string from an image object or string.
 * This prevents the "Value for uri cannot be cast from ReadableNativeMap to String" error
 * in React Native / Expo.
 * 
 * @param {string|object} img - The image source (string URI or object)
 * @returns {string|null} - The extracted URI string or null
 */
export const getImageUri = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  
  // Handle cases where img might be an object like { url: '...' } or { uri: '...' }
  const uri = img?.url || img?.uri || img?.path;
  
  return typeof uri === 'string' ? uri : null;
};
