// This file contains static options for districts, geographies, and genders
// These should match the backend models exactly
export const DISTRICTS = [
  { code: 'TVM', name: 'Thiruvananthapuram' },
  { code: 'KLM', name: 'Kollam' },
  { code: 'PTA', name: 'Pathanamthitta' },
  { code: 'ALP', name: 'Alappuzha' },
  { code: 'KTM', name: 'Kottayam' },
  { code: 'IDK', name: 'Idukki' },
  { code: 'EKM', name: 'Ernakulam' },
  { code: 'TSR', name: 'Thrissur' },
  { code: 'PLK', name: 'Palakkad' },
  { code: 'MLP', name: 'Malappuram' },
  { code: 'KKD', name: 'Kozhikode' },
  { code: 'WYD', name: 'Wayanad' },
  { code: 'KGD', name: 'Kasaragod' },
  { code: 'KNR', name: 'Kannur' },
];

export const GEOGRAPHIES = [
  { code: 'ADV', name: 'Adventure Sports' },
  { code: 'BEACH', name: 'Beach & Coastal' },
  { code: 'CAVE', name: 'Cave Entrance' },
  { code: 'CLFF', name: 'Cliff' },
  { code: 'CULT', name: 'Cultural Sites' },
  { code: 'DUNE', name: 'Sand Dune' },
  { code: 'FRST', name: 'Forests & Wildlife' },
  { code: 'GEYSER', name: 'Geyser' },
  { code: 'GLCR', name: 'Glacier' },
  { code: 'HILL', name: 'Hills & Mountains' },
  { code: 'HIST', name: 'Historical Sites' },
  { code: 'HTSPR', name: 'Hot Spring' },
  { code: 'LAKE', name: 'Lakes & Backwaters' },
  { code: 'MNTN', name: 'Mountain Region' },
  { code: 'NTLPRK', name: 'National Park' },
  { code: 'NTRL', name: 'Natural Area' },
  { code: 'PEAK', name: 'Mountain Peak' },
  { code: 'PRTA', name: 'Protected Area' },
  { code: 'REEF', name: 'Reef' },
  { code: 'ROCK', name: 'Rock Formation' },
  { code: 'SAND', name: 'Sandy Area' },
  { code: 'SEA', name: 'Sea' },
  { code: 'SPR', name: 'Spring' },
  { code: 'SPRT', name: 'Spiritual Places' },
  { code: 'WTR', name: 'Water Body' },
];

export const GENDERS = [
  { code: 'M', label: 'Male' },
  { code: 'F', label: 'Female' },
  { code: 'O', label: 'Other' },
]; 

// Local Host Service Options
export const LOCAL_HOST_SERVICES = [
  { code: 'ACCOMMODATION', name: 'Accommodation (Room/House Rental)' },
  { code: 'FOOD', name: 'Food Services' },
  { code: 'GUIDE', name: 'Local Guiding Services' },
  { code: 'TRANSPORT', name: 'Transportation Services' },
  { code: 'EXPERIENCE', name: 'Local Experiences & Activities' },
  { code: 'PHOTOGRAPHY', name: 'Photography Services' },
  { code: 'OTHER', name: 'Other Services' },
];

// Document Types for Verification
export const DOCUMENT_TYPES = [
  { code: 'AADHAAR', name: 'Aadhaar Card' },
  { code: 'PAN', name: 'PAN Card' },
  { code: 'PASSPORT', name: 'Passport' },
  { code: 'DRIVING_LICENSE', name: 'Driving License' },
  { code: 'VOTER_ID', name: 'Voter ID' },
];