export const setEqual = <Item>(
  setA: Item[],
  setB: Item[],
  getHash: (i: Item) => string | number | symbol,
) => {
  const setAHashTable: { [hash: string | number | symbol]: boolean } = {}
  for (const i of setA) {
    setAHashTable[getHash(i)] = true
  }
  return (
    setA.length === setB.length && setB.every(i => getHash(i) in setAHashTable)
  )
}

export default setEqual
