export function getExplorerUrl(
  transactionHash: string,
  network = 'Ethereum'
): string {
  const baseUrls: Record<string, string> = {
    Ethereum: 'https://etherscan.io/tx/',
    Polygon: 'https://polygonscan.com/tx/',
    Bitcoin: 'https://blockchair.com/bitcoin/transaction/',
  };

  return `${baseUrls[network] || baseUrls.Ethereum}${transactionHash}`;
}

export function shortenHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
