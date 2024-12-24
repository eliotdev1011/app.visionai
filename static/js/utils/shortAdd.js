const shortAdd = (address, side = 4) => {
  return address.slice(0, side) + "..." + address.slice(-side);
};

export default shortAdd;
