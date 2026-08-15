/**
 * Global Error Message Mapper
 * Translates backend errors to user-friendly messages (Somali & English)
 */

// Error message translations (Somali)
const errorTranslations = {
  // Authentication errors
  'invalid credentials': 'Email ama password waa khalad.',
  'invalid email or password': 'Email ama password waa khalad.',
  'invalid student id or password': 'Student ID ama password waa khalad.',
  'invalid teacher id or password': 'Teacher ID ama password waa khalad.',
  'account inactive': 'Account-kaaga waa la xiray. Fadlan la xiriir super admin.',
  'session expired': 'Session-kaaga waa dhamaaday. Fadlan dib u gal.',
  'token expired': 'Session-kaaga waa dhamaaday. Fadlan dib u gal.',
  'unauthorized': 'Ogolaansho ma lihid. Fadlan gal mar kale.',
  'forbidden': 'Ma geli kartid qaybtan.',
  
  // School status errors
  'school blocked': `Dugsigaaga waxaa si kumeel gaar ah u joojiyay super admin-ka.\n\nSababta: Maamulka ayaa xiray\n\nFadlan la xiriir super admin-ka si aad ugala hadasho goorta dugsigaaga dib loo hawlgelin karo.`,
  'school inactive': 'Dugsigaagu hadda shaqayn maayo. Fadlan la xiriir super admin.',
  'subscription expired': 'Subscription-ka dugsiga waa dhamaaday. Fadlan la xiriir super admin.',
  
  // Not found errors
  'student not found': 'Arday lama helin.',
  'teacher not found': 'Macalin lama helin.',
  'class not found': 'Fasal lama helin.',
  'subject not found': 'Maado lama helin.',
  'exam not found': 'Imtixaan lama helin.',
  'schedule not found': 'Jadwal lama helin.',
  'user not found': 'Isticmaalaha lama helin.',
  'school not found': 'Dugsi lama helin.',
  'payment month not found': 'Bisha lacag-bixinta lama helin.',
  'assignment not found': 'Assignment-ka lama helin.',
  'exam session not found': 'Imtixaanka session-ka lama helin.',
  
  // Duplicate errors
  'already exists': 'Xogtan hore ayaa loo diiwaan geliyay.',
  'already registered': 'Tan hore ayaa loo diiwaan geliyay.',
  'duplicate': 'Xogtan hore ayaa loo geliyay.',
  'student id already': 'Student ID-gan hore ayaa loo isticmaalay. Fadlan mid kale dooro.',
  'teacher id already': 'Teacher ID-gan hore ayaa loo isticmaalay. Fadlan mid kale dooro.',
  'email already': 'Email-kan hore ayaa loo diiwaan geliyay. Fadlan mid kale isticmaal.',
  'subject code already': 'Subject code-kan hore ayaa loo isticmaalay. Fadlan mid kale dooro.',
  'class.*already exists': 'Fasalkan magacan iyo section-kan hore ayaa u jira. Fadlan magac ama section kale dooro.',
  
  // Validation errors
  'validation': 'Xogta aad gelisay waa khalad. Fadlan hubi oo dib u isku day.',
  'is required': 'waa loo baahan yahay.',
  'must be': 'waa inuu noqdaa.',
  'invalid date': 'Taariikhda waa khalad. Fadlan isticmaal format-ka saxda ah (YYYY-MM-DD).',
  'invalid time': 'Saacaddu waa khalad. Fadlan isticmaal format-ka saxda ah (HH:MM).',
  'invalid exam type': 'Nooca imtixaanka waa khalad. Fadlan nooc sax ah dooro.',
  'max students must': 'Tirada ardayda waa khalad. Fadlan number sax ah geli.',
  
  // Marks & Grades
  'marks exceed': 'Buundada kama badnaan karto max marks.',
  'marks cannot': 'Buundada sax ma aha.',
  'invalid marks': 'Buundada aad gelisay waa khalad.',
  
  // Permission errors
  'permission': 'Ogolaansho ma lihid si aad tan u sameyso.',
  'not authorized': 'Ogolaansho ma lihid.',
  'you are not assigned': 'Maada imtixaankan lama xidhmin. Fadlan la xiriir admin.',
  'invalid teacher': 'Macalinkani dugsigan kama mid aha. Fadlan macalin dugsiga ka mid ah dooro.',
  
  // Delete errors
  'cannot delete': 'Tirtiri ma kartid. Xogtan waxay ku xidhan tahay records kale.',
  'delete all users first': 'Hortaa isticmaalayaasha oo dhan tirti ama dugsiga hakad geli.',
  
  // Network errors
  'network': 'Internet ma jiro ama server lama gaarin. Fadlan connection-ka hubi.',
  'timeout': 'Request-ku waa dhamaaday. Fadlan mar kale isku day.',
  'fetch error': 'Internet ma jiro ama server lama gaarin.',
  
  // Server errors
  'server error': 'Cilad server ayaa jirta. Fadlan mar kale isku day.',
  'internal server': 'Cilad server ayaa jirta. Fadlan mar kale isku day.',
  
  // Exam Hall specific errors
  'already exists for this date and session': 'Horey ayaa loo diiwaan geliyay hall kan taariikhdan iyo session kan.',
  'capacity cannot be less than': 'Tirada hall-ka kama yaraan karto tirada ardayda hadda ku jirta.',
  'already assigned to another hall on this date': 'Macalinkaan horey ayaa loogu qoray hall kale maanta. Macalin ma kormeeri karo labo hall isku mar.',
  'already enrolled in another hall for this session': 'Ardaygaan horey ayaa loogu qoray hall kale session-kan. Arday ma dhigan karo labo hall isku mar.',
  'already assigned to this hall': 'Ardaygaan horey ayaa hall-ka loogu qoray.',
  'exam hall is at full capacity': 'Hall-kan waa uu buuxaa.',
  
  // Generic fallback
  'default': 'Cilad ayaa dhacday. Fadlan mar kale isku day.',
  'something went wrong': 'Cilad ayaa dhacday. Fadlan mar kale isku day.',
  'Exam hall updated successfully': 'Hoolka imtixaanka waa la cusboonaysiiyay.',
  'Exam hall created successfully': 'Hoolka imtixaanka waa la abuuray.',
};

/**
 * Get user-friendly error message with Somali translation
 * @param {string} technicalMessage - Backend error message
 * @param {string} userMessage - Backend userMessage (if available)
 * @returns {string} Translated user-friendly message
 */
export const getErrorMessage = (technicalMessage = '', userMessage = '') => {
  // If backend provides userMessage, use it (highest priority)
  if (userMessage && userMessage.trim()) {
    return userMessage;
  }
  
  // If no message at all, return default
  if (!technicalMessage || !technicalMessage.trim()) {
    return errorTranslations['default'];
  }
  
  const lowerMessage = technicalMessage.toLowerCase();
  
  // Check for matching translations
  for (const [key, translation] of Object.entries(errorTranslations)) {
    // Handle regex-like patterns (e.g., "class.*already exists")
    if (key.includes('.*')) {
      const regex = new RegExp(key, 'i');
      if (regex.test(lowerMessage)) {
        return translation;
      }
    } 
    // Simple includes check
    else if (lowerMessage.includes(key)) {
      return translation;
    }
  }
  
  // If no translation found, return the original message
  return technicalMessage;
};

/**
 * Get appropriate toast duration based on error type
 * @param {string} message - Error message
 * @returns {number} Duration in milliseconds
 */
export const getToastDuration = (message) => {
  const lowerMsg = message.toLowerCase();
  
  // Long messages need more time
  if (lowerMsg.includes('\n') || message.length > 150) {
    return 8000;
  }
  
  // Network errors - longer
  if (lowerMsg.includes('internet') || lowerMsg.includes('connection')) {
    return 7000;
  }
  
  // Default
  return 6000;
};

/**
 * Get toast style based on message type
 * @param {string} message - Error message
 * @returns {Object} Style object
 */
export const getToastStyle = (message) => {
  const baseStyle = {
    maxWidth: '550px',
    wordWrap: 'break-word',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
  };
  
  // Multi-line messages
  if (message.includes('\n')) {
    return {
      ...baseStyle,
      whiteSpace: 'pre-line',
      lineHeight: '1.6',
    };
  }
  
  return baseStyle;
};

export default { getErrorMessage, getToastDuration, getToastStyle };
