const getChainIdByName = (name) => {
  const nameToChainId = {
    Ethereum: 1,
    Base: 8453,
  };

  return nameToChainId[name];
};

export default getChainIdByName;
