// Check if localStorage is available
const isLocalStorageAvailable = () => {
    const storageCheck = 'storageCheck';
    try {
        localStorage.setItem(storageCheck, storageCheck);
        localStorage.removeItem(storageCheck);
        return true;
    } catch(e) {
        return false;
    }
};

// Select a random element from an array
const selectRandomElement = (arr) => {
  if (arr.length === 0) {
    throw "Cannot select a random element from an empty array";
  }
  return arr[Math.floor(Math.random() * arr.length)];
};

export {
  selectRandomElement,
  isLocalStorageAvailable
};
