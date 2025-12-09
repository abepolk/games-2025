// Select a random element from an array
const selectRandomElement = (arr, getRandom) => {
  if (arr.length === 0) {
    throw "Cannot select a random element from an empty array";
  }
  return arr[Math.floor(getRandom() * arr.length)];
};

export {
  selectRandomElement
};