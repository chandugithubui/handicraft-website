/**
 * Indian States, Union Territories, and Major Cities
 * Comprehensive dataset for checkout address autocomplete
 */

export interface StateData {
  name: string;
  cities: string[];
}

export const INDIAN_STATES_AND_UTS: StateData[] = [
  {
    name: 'Andhra Pradesh',
    cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa']
  },
  {
    name: 'Arunachal Pradesh',
    cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Anini']
  },
  {
    name: 'Assam',
    cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar']
  },
  {
    name: 'Bihar',
    cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar']
  },
  {
    name: 'Chhattisgarh',
    cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur']
  },
  {
    name: 'Goa',
    cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim']
  },
  {
    name: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Bharuch']
  },
  {
    name: 'Haryana',
    cities: ['Faridabad', 'Gurgaon', 'Gurugram', 'Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Sonipat', 'Ambala', 'Yamunanagar', 'Panchkula']
  },
  {
    name: 'Himachal Pradesh',
    cities: ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Kullu', 'Manali', 'Hamirpur', 'Una', 'Bilaspur']
  },
  {
    name: 'Jharkhand',
    cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar']
  },
  {
    name: 'Karnataka',
    cities: ['Bengaluru', 'Bangalore', 'Mysuru', 'Mysore', 'Hubli', 'Mangaluru', 'Mangalore', 'Belgaum', 'Belagavi', 'Davangere', 'Ballari', 'Tumkur', 'Shivamogga', 'Raichur', 'Udupi', 'Bidar']
  },
  {
    name: 'Kerala',
    cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Calicut', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod', 'Kottayam']
  },
  {
    name: 'Madhya Pradesh',
    cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni', 'Singrauli']
  },
  {
    name: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Nanded', 'Sangli', 'Akola', 'Latur', 'Jalgaon']
  },
  {
    name: 'Manipur',
    cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul', 'Senapati']
  },
  {
    name: 'Meghalaya',
    cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Baghmara', 'Williamnagar']
  },
  {
    name: 'Mizoram',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Mamit']
  },
  {
    name: 'Nagaland',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto']
  },
  {
    name: 'Odisha',
    cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh']
  },
  {
    name: 'Punjab',
    cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Malerkotla']
  },
  {
    name: 'Rajasthan',
    cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Tonk']
  },
  {
    name: 'Sikkim',
    cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo', 'Jorethang']
  },
  {
    name: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Trichy', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Dindigul', 'Nagercoil']
  },
  {
    name: 'Telangana',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahabubnagar', 'Nalgonda', 'Adilabad', 'Suryapet']
  },
  {
    name: 'Tripura',
    cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Ambassa', 'Belonia']
  },
  {
    name: 'Uttar Pradesh',
    cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar']
  },
  {
    name: 'Uttarakhand',
    cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Pithoragarh']
  },
  {
    name: 'West Bengal',
    cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Barddhaman', 'Malda', 'Baharampur', 'Kharagpur', 'Haldia', 'Darjeeling']
  },
  // Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    cities: ['Port Blair', 'Diglipur', 'Rangat', 'Mayabunder', 'Car Nicobar', 'Havelock Island']
  },
  {
    name: 'Chandigarh',
    cities: ['Chandigarh']
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    cities: ['Daman', 'Diu', 'Silvassa']
  },
  {
    name: 'Delhi',
    cities: ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Janakpuri', 'Saket', 'Vasant Kunj', 'Karol Bagh', 'Connaught Place', 'Lajpat Nagar']
  },
  {
    name: 'Jammu and Kashmir',
    cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur']
  },
  {
    name: 'Ladakh',
    cities: ['Leh', 'Kargil', 'Nubra', 'Zanskar']
  },
  {
    name: 'Lakshadweep',
    cities: ['Kavaratti', 'Agatti', 'Minicoy', 'Amini']
  },
  {
    name: 'Puducherry',
    cities: ['Puducherry', 'Pondicherry', 'Karaikal', 'Mahe', 'Yanam']
  }
];

// Helper function to get state names
export const getStateNames = (): string[] => {
  return INDIAN_STATES_AND_UTS.map(state => state.name);
};

// Helper function to get cities for a state
export const getCitiesForState = (stateName: string): string[] => {
  const state = INDIAN_STATES_AND_UTS.find(
    s => s.name.toLowerCase() === stateName.toLowerCase()
  );
  return state ? state.cities : [];
};

// Helper function to search states
export const searchStates = (query: string): string[] => {
  if (!query.trim()) return getStateNames();

  const lowerQuery = query.toLowerCase();
  return getStateNames().filter(state =>
    state.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to search cities within a state
export const searchCities = (stateName: string, query: string): string[] => {
  const cities = getCitiesForState(stateName);
  if (!query.trim()) return cities;

  const lowerQuery = query.toLowerCase();
  return cities.filter(city =>
    city.toLowerCase().includes(lowerQuery)
  );
};
