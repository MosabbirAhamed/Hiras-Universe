export type District = {
  name: string
  division: string
}

export const DHAKA_DELIVERY_CHARGE = 60
export const OUTSIDE_DHAKA_DELIVERY_CHARGE = 120

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { name: 'Dhaka', division: 'Dhaka' },
  { name: 'Gazipur', division: 'Dhaka' },
  { name: 'Narayanganj', division: 'Dhaka' },
  { name: 'Tangail', division: 'Dhaka' },
  { name: 'Kishoreganj', division: 'Dhaka' },
  { name: 'Manikganj', division: 'Dhaka' },
  { name: 'Munshiganj', division: 'Dhaka' },
  { name: 'Narsingdi', division: 'Dhaka' },
  { name: 'Faridpur', division: 'Dhaka' },
  { name: 'Gopalganj', division: 'Dhaka' },
  { name: 'Madaripur', division: 'Dhaka' },
  { name: 'Rajbari', division: 'Dhaka' },
  { name: 'Shariatpur', division: 'Dhaka' },

  // Chattogram Division
  { name: 'Chattogram', division: 'Chattogram' },
  { name: "Cox's Bazar", division: 'Chattogram' },
  { name: 'Cumilla', division: 'Chattogram' },
  { name: 'Feni', division: 'Chattogram' },
  { name: 'Brahmanbaria', division: 'Chattogram' },
  { name: 'Noakhali', division: 'Chattogram' },
  { name: 'Chandpur', division: 'Chattogram' },
  { name: 'Lakshmipur', division: 'Chattogram' },
  { name: 'Rangamati', division: 'Chattogram' },
  { name: 'Khagrachhari', division: 'Chattogram' },
  { name: 'Bandarban', division: 'Chattogram' },

  // Sylhet Division
  { name: 'Sylhet', division: 'Sylhet' },
  { name: 'Moulvibazar', division: 'Sylhet' },
  { name: 'Habiganj', division: 'Sylhet' },
  { name: 'Sunamganj', division: 'Sylhet' },

  // Rajshahi Division
  { name: 'Rajshahi', division: 'Rajshahi' },
  { name: 'Bogura', division: 'Rajshahi' },
  { name: 'Pabna', division: 'Rajshahi' },
  { name: 'Sirajganj', division: 'Rajshahi' },
  { name: 'Naogaon', division: 'Rajshahi' },
  { name: 'Natore', division: 'Rajshahi' },
  { name: 'Chapainawabganj', division: 'Rajshahi' },
  { name: 'Joypurhat', division: 'Rajshahi' },

  // Khulna Division
  { name: 'Khulna', division: 'Khulna' },
  { name: 'Jashore', division: 'Khulna' },
  { name: 'Satkhira', division: 'Khulna' },
  { name: 'Bagerhat', division: 'Khulna' },
  { name: 'Kushtia', division: 'Khulna' },
  { name: 'Chuadanga', division: 'Khulna' },
  { name: 'Jhenaidah', division: 'Khulna' },
  { name: 'Magura', division: 'Khulna' },
  { name: 'Meherpur', division: 'Khulna' },
  { name: 'Narail', division: 'Khulna' },

  // Barishal Division
  { name: 'Barishal', division: 'Barishal' },
  { name: 'Patuakhali', division: 'Barishal' },
  { name: 'Bhola', division: 'Barishal' },
  { name: 'Pirojpur', division: 'Barishal' },
  { name: 'Barguna', division: 'Barishal' },
  { name: 'Jhalokathi', division: 'Barishal' },

  // Rangpur Division
  { name: 'Rangpur', division: 'Rangpur' },
  { name: 'Dinajpur', division: 'Rangpur' },
  { name: 'Gaibandha', division: 'Rangpur' },
  { name: 'Kurigram', division: 'Rangpur' },
  { name: 'Lalmonirhat', division: 'Rangpur' },
  { name: 'Nilphamari', division: 'Rangpur' },
  { name: 'Panchagarh', division: 'Rangpur' },
  { name: 'Thakurgaon', division: 'Rangpur' },

  // Mymensingh Division
  { name: 'Mymensingh', division: 'Mymensingh' },
  { name: 'Jamalpur', division: 'Mymensingh' },
  { name: 'Netrokona', division: 'Mymensingh' },
  { name: 'Sherpur', division: 'Mymensingh' }
]

const districtNameSet = new Set(BANGLADESH_DISTRICTS.map((d) => d.name.toLowerCase()))

export function getDistricts(): District[] {
  return [...BANGLADESH_DISTRICTS]
}

export function isValidDistrict(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  return districtNameSet.has(name.trim().toLowerCase())
}

export function normalizeDistrictName(name: string): string {
  const match = BANGLADESH_DISTRICTS.find((d) => d.name.toLowerCase() === name.trim().toLowerCase())
  return match ? match.name : name.trim()
}

export function getDeliveryCharge(districtName: string): number {
  if (!districtName || typeof districtName !== 'string') {
    return OUTSIDE_DHAKA_DELIVERY_CHARGE
  }
  const clean = districtName.trim().toLowerCase()
  if (clean === 'dhaka') {
    return DHAKA_DELIVERY_CHARGE
  }
  return OUTSIDE_DHAKA_DELIVERY_CHARGE
}
