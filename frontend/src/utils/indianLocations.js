// Indian location utilities using country-state-city library
import { State, City } from 'country-state-city';

// India country code in the library
const INDIA_CODE = 'IN';

// Get all Indian states sorted by name
export const getAllStates = () => {
  return State.getStatesOfCountry(INDIA_CODE)
    .map(s => s.name)
    .sort();
};

// Get the isoCode for a state name (needed to fetch cities)
const getStateIsoCode = (stateName) => {
  const states = State.getStatesOfCountry(INDIA_CODE);
  const match = states.find(
    s => s.name.toLowerCase() === stateName.toLowerCase()
  );
  return match?.isoCode || '';
};

// Get cities for a given state name
export const getCitiesForState = (stateName) => {
  const isoCode = getStateIsoCode(stateName);
  if (!isoCode) return [];
  return City.getCitiesOfState(INDIA_CODE, isoCode)
    .map(c => c.name)
    .sort();
};

// Lookup city & state from pincode using India Post API
export const lookupPincode = async (pin) => {
  if (!/^\d{6}$/.test(pin)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return {
        state: po.State || '',
        city: po.District || po.Division || '',
        postOffice: po.Name || '',
      };
    }
  } catch (err) {
    console.error('Pincode lookup failed:', err);
  }
  return null;
};