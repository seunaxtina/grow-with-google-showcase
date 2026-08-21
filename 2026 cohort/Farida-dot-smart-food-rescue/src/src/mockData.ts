import { Vendor, Pantry, Volunteer, Listing, Match, ImpactLog } from './types';

export const NAIROBI_HUBS = [
  { name: 'Kibera Community Center', subCounty: 'Kibra', lat: -1.3134, lng: 36.7882 },
  { name: 'Mathare Youth Kitchen', subCounty: 'Mathare', lat: -1.2589, lng: 36.8587 },
  { name: 'Westlands Fresh Produce Market', subCounty: 'Westlands', lat: -1.2683, lng: 36.8111 },
  { name: 'Eastleigh Wholesalers Hub', subCounty: 'Kamukunji', lat: -1.2758, lng: 36.8504 },
  { name: 'City Market CBD', subCounty: 'Starehe', lat: -1.2828, lng: 36.8219 },
  { name: 'Kawangware Food Relief Center', subCounty: 'Dagoretti North', lat: -1.2811, lng: 36.7468 },
  { name: 'Kangemi Community Care', subCounty: 'Dagoretti North', lat: -1.2625, lng: 36.7443 },
  { name: 'Mukuru Kwa Njenga Kitchen', subCounty: 'Embakasi South', lat: -1.3255, lng: 36.8795 },
  { name: 'Githurai 45 Fresh Market', subCounty: 'Ruaraka / Kasarani', lat: -1.1983, lng: 36.9288 },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    vendor_id: 'v_1',
    name: 'Westlands Supermarket & Bakery',
    type: 'supermarket',
    location: {
      lat: -1.2683,
      lng: 36.8111,
      address: 'Waiyaki Way, Westlands, Nairobi',
      subCounty: 'Westlands'
    },
    contact: '+254 712 345 678',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    rating: 4.8
  },
  {
    vendor_id: 'v_2',
    name: 'Mama Ngina Market Stall',
    type: 'market_stall',
    location: {
      lat: -1.2828,
      lng: 36.8219,
      address: 'City Market, Muindi Mbingu St, Nairobi CBD',
      subCounty: 'Starehe'
    },
    contact: '+254 722 987 654',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    rating: 4.9
  },
  {
    vendor_id: 'v_3',
    name: 'Eastleigh Grocers Depot',
    type: 'grocery_store',
    location: {
      lat: -1.2758,
      lng: 36.8504,
      address: '1st Avenue, Eastleigh, Nairobi',
      subCounty: 'Kamukunji'
    },
    contact: '+254 733 112 233',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    rating: 4.7
  },
  {
    vendor_id: 'v_4',
    name: 'Githurai Fresh Farms Cooperative',
    type: 'farm',
    location: {
      lat: -1.1983,
      lng: 36.9288,
      address: 'Thika Superhighway, Githurai 45, Nairobi',
      subCounty: 'Kasarani'
    },
    contact: '+254 701 445 566',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    rating: 4.6
  }
];

export const INITIAL_PANTRIES: Pantry[] = [
  {
    pantry_id: 'p_1',
    name: 'Kibera Hope Children & Community Pantry',
    type: 'community_center',
    location: {
      lat: -1.3134,
      lng: 36.7882,
      address: 'Olympic Primary Rd, Kibera, Nairobi',
      subCounty: 'Kibra'
    },
    need_score: 9,
    beneficiaries_count: 240,
    contact: '+254 720 111 222',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    recent_pickups_count: 2
  },
  {
    pantry_id: 'p_2',
    name: 'Mathare Care Youth Feeding Station',
    type: 'school_feeding',
    location: {
      lat: -1.2589,
      lng: 36.8587,
      address: 'Mathare 4A, Near Police Station, Nairobi',
      subCounty: 'Mathare'
    },
    need_score: 10,
    beneficiaries_count: 310,
    contact: '+254 721 333 444',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    recent_pickups_count: 1
  },
  {
    pantry_id: 'p_3',
    name: 'Kawangware Peace Community Shelter',
    type: 'shelter',
    location: {
      lat: -1.2811,
      lng: 36.7468,
      address: 'Naivasha Road, Kawangware, Nairobi',
      subCounty: 'Dagoretti North'
    },
    need_score: 8,
    beneficiaries_count: 180,
    contact: '+254 734 555 666',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    recent_pickups_count: 4
  },
  {
    pantry_id: 'p_4',
    name: 'Mukuru Kwa Njenga Feeding Center',
    type: 'pantry',
    location: {
      lat: -1.3255,
      lng: 36.8795,
      address: 'Pipeline / Mukuru Slum Area, Nairobi',
      subCounty: 'Embakasi South'
    },
    need_score: 9,
    beneficiaries_count: 280,
    contact: '+254 718 777 888',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    recent_pickups_count: 2
  }
];

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    volunteer_id: 'vol_1',
    name: 'David Omondi',
    phone: '+254 711 990 011',
    vehicle_type: 'boda_boda',
    status: 'available',
    current_location: {
      lat: -1.2800,
      lng: 36.8150,
      address: 'Ngara Boda Stage, Nairobi'
    },
    total_deliveries: 38
  },
  {
    volunteer_id: 'vol_2',
    name: 'Amina Mohamed',
    phone: '+254 722 881 122',
    vehicle_type: 'tuk_tuk',
    status: 'available',
    current_location: {
      lat: -1.2720,
      lng: 36.8450,
      address: 'Pangani Junction, Nairobi'
    },
    total_deliveries: 52
  },
  {
    volunteer_id: 'vol_3',
    name: 'Peter Waweru',
    phone: '+254 733 772 233',
    vehicle_type: 'pickup_truck',
    status: 'available',
    current_location: {
      lat: -1.2650,
      lng: 36.8000,
      address: 'Westlands Park, Nairobi'
    },
    total_deliveries: 24
  },
  {
    volunteer_id: 'vol_4',
    name: 'Grace Mutua',
    phone: '+254 700 663 344',
    vehicle_type: 'walking',
    status: 'available',
    current_location: {
      lat: -1.3100,
      lng: 36.7850,
      address: 'Kibera Drive Stage, Nairobi'
    },
    total_deliveries: 19
  }
];

const now = Date.now();

export const INITIAL_LISTINGS: Listing[] = [
  {
    listing_id: 'lst_101',
    vendor_id: 'v_1',
    vendor_name: 'Westlands Supermarket & Bakery',
    vendor_address: 'Waiyaki Way, Westlands, Nairobi',
    vendor_location: {
      lat: -1.2683,
      lng: 36.8111,
      address: 'Waiyaki Way, Westlands, Nairobi',
      subCounty: 'Westlands'
    },
    item_name: 'Freshly Baked Whole Wheat Loaves',
    category: 'bakery',
    quantity: 35,
    unit: 'units',
    expiry_at: new Date(now + 3 * 3600 * 1000).toISOString(), // Expires in 3 hours
    status: 'open',
    created_at: new Date(now - 30 * 60 * 1000).toISOString(),
    notes: 'Surplus day bake, fully wrapped and ready for consumption.'
  },
  {
    listing_id: 'lst_102',
    vendor_id: 'v_2',
    vendor_name: 'Mama Ngina Market Stall',
    vendor_address: 'City Market, Muindi Mbingu St, Nairobi CBD',
    vendor_location: {
      lat: -1.2828,
      lng: 36.8219,
      address: 'City Market, Muindi Mbingu St, Nairobi CBD',
      subCounty: 'Starehe'
    },
    item_name: 'Ripe Bananas & Organic Sukuma Wiki (Kale)',
    category: 'produce',
    quantity: 60,
    unit: 'kg',
    expiry_at: new Date(now + 6 * 3600 * 1000).toISOString(), // Expires in 6 hours
    status: 'open',
    created_at: new Date(now - 45 * 60 * 1000).toISOString(),
    notes: 'Slightly ripe sweet bananas and 3 crates of crisp kale.'
  },
  {
    listing_id: 'lst_103',
    vendor_id: 'v_3',
    vendor_name: 'Eastleigh Grocers Depot',
    vendor_address: '1st Avenue, Eastleigh, Nairobi',
    vendor_location: {
      lat: -1.2758,
      lng: 36.8504,
      address: '1st Avenue, Eastleigh, Nairobi',
      subCounty: 'Kamukunji'
    },
    item_name: 'Grade A Milk Cartons (Pasteurized)',
    category: 'dairy',
    quantity: 40,
    unit: 'units',
    expiry_at: new Date(now + 12 * 3600 * 1000).toISOString(), // Expires in 12 hours
    status: 'open',
    created_at: new Date(now - 120 * 60 * 1000).toISOString(),
    notes: 'Stored cold in refrigerated unit. Best consumed today.'
  },
  {
    listing_id: 'lst_104',
    vendor_id: 'v_4',
    vendor_name: 'Githurai Fresh Farms Cooperative',
    vendor_address: 'Thika Superhighway, Githurai 45, Nairobi',
    vendor_location: {
      lat: -1.1983,
      lng: 36.9288,
      address: 'Thika Superhighway, Githurai 45, Nairobi',
      subCounty: 'Kasarani'
    },
    item_name: 'Fresh Tomatoes & Green Bell Peppers',
    category: 'produce',
    quantity: 85,
    unit: 'kg',
    expiry_at: new Date(now + 18 * 3600 * 1000).toISOString(),
    status: 'open',
    created_at: new Date(now - 180 * 60 * 1000).toISOString(),
    notes: 'Grade B tomatoes perfect for stews or soup preparations.'
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    match_id: 'm_201',
    listing_id: 'lst_99',
    pantry_id: 'p_1',
    volunteer_id: 'vol_1',
    score: 88.4,
    breakdown: {
      proximity_score: 82.5,
      urgency_score: 90.0,
      pantry_need_score: 95.0,
      distance_km: 3.5,
      travel_time_mins: 14
    },
    status: 'delivered',
    matched_at: new Date(now - 5 * 3600 * 1000).toISOString(),
    listing: {
      listing_id: 'lst_99',
      vendor_id: 'v_2',
      vendor_name: 'Mama Ngina Market Stall',
      vendor_address: 'City Market, Muindi Mbingu St, Nairobi CBD',
      vendor_location: { lat: -1.2828, lng: 36.8219, address: 'City Market CBD' },
      item_name: 'Carrots & Sweet Potatoes',
      category: 'produce',
      quantity: 50,
      unit: 'kg',
      expiry_at: new Date(now - 1 * 3600 * 1000).toISOString(),
      status: 'completed',
      created_at: new Date(now - 8 * 3600 * 1000).toISOString()
    },
    pantry: INITIAL_PANTRIES[0],
    volunteer: INITIAL_VOLUNTEERS[0]
  },
  {
    match_id: 'm_202',
    listing_id: 'lst_98',
    pantry_id: 'p_2',
    volunteer_id: 'vol_2',
    score: 91.2,
    breakdown: {
      proximity_score: 88.0,
      urgency_score: 92.0,
      pantry_need_score: 98.0,
      distance_km: 2.4,
      travel_time_mins: 10
    },
    status: 'delivered',
    matched_at: new Date(now - 2 * 3600 * 1000).toISOString(),
    listing: {
      listing_id: 'lst_98',
      vendor_id: 'v_3',
      vendor_name: 'Eastleigh Grocers Depot',
      vendor_address: '1st Avenue, Eastleigh',
      vendor_location: { lat: -1.2758, lng: 36.8504, address: 'Eastleigh 1st Ave' },
      item_name: 'Nutritious Maize Flour Bags (Ugali Meal)',
      category: 'packaged_goods',
      quantity: 75,
      unit: 'kg',
      expiry_at: new Date(now + 24 * 3600 * 1000).toISOString(),
      status: 'completed',
      created_at: new Date(now - 4 * 3600 * 1000).toISOString()
    },
    pantry: INITIAL_PANTRIES[1],
    volunteer: INITIAL_VOLUNTEERS[1]
  }
];

export const INITIAL_IMPACT_LOGS: ImpactLog[] = [
  {
    log_id: 'log_1',
    match_id: 'm_201',
    kg_redirected: 50,
    meals_estimated: 125, // 50 * 2.5
    co2_avoided_kg: 125, // 50 * 2.5
    timestamp: new Date(now - 5 * 3600 * 1000).toISOString(),
    item_name: 'Carrots & Sweet Potatoes',
    pantry_name: 'Kibera Hope Children & Community Pantry',
    vendor_name: 'Mama Ngina Market Stall'
  },
  {
    log_id: 'log_2',
    match_id: 'm_202',
    kg_redirected: 75,
    meals_estimated: 187.5,
    co2_avoided_kg: 187.5,
    timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
    item_name: 'Nutritious Maize Flour Bags (Ugali Meal)',
    pantry_name: 'Mathare Care Youth Feeding Station',
    vendor_name: 'Eastleigh Grocers Depot'
  },
  {
    log_id: 'log_3',
    match_id: 'm_200',
    kg_redirected: 120,
    meals_estimated: 300,
    co2_avoided_kg: 300,
    timestamp: new Date(now - 24 * 3600 * 1000).toISOString(),
    item_name: 'Canned Beans & Mixed Vegetable Crates',
    pantry_name: 'Mukuru Kwa Njenga Feeding Center',
    vendor_name: 'Westlands Supermarket'
  }
];
