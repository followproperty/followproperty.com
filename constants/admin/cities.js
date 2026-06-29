/**
 * Scalable master configuration for Indian Cities and their respective States.
 * Add new supported cities to this object. 
 * 
 * Enables dynamic dropdown validation and automatic state mapping on project creation.
 */
export const CITY_TO_STATE = {
  "Gurgaon": "Haryana",
  "Noida": "Uttar Pradesh",
  "Vrindavan": "Uttar Pradesh",
  "Delhi": "Delhi",
  "Mumbai": "Maharashtra",
  "Pune": "Maharashtra",
  "Hyderabad": "Telangana",
  "Bengaluru": "Karnataka",
  "Chennai": "Tamil Nadu",
  "Ahmedabad": "Gujarat",
  "Kolkata": "West Bengal",
  "Jaipur": "Rajasthan",
  "Lucknow": "Uttar Pradesh",
  "Nagpur": "Maharashtra"
};

export const CITIES = Object.keys(CITY_TO_STATE).sort();
