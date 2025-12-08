// Select a random element from an array
const selectRandomElement = (arr, getRandom) => {
  const x = getRandom()
  if (arr.length === 0) {
    throw "Cannot select a random element from an empty array";
  }
  // console.log(arr);
  // console.log(x);
  return arr[Math.floor(x * arr.length)];
};

export {
  selectRandomElement
};