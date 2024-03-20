// data.js
let myValue = { latitude: 0, longitude: 0 };

export const setValue = (newValue: { latitude: number; longitude: number }) => {
  myValue = newValue; // Update the value
};

export const getLatestValue = () => {
  return myValue; // Retrieve the latest value
};
