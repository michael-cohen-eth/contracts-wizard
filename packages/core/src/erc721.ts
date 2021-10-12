import { BaseFunction, Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';

export interface ERC721Options extends CommonOptions {
  name: string;
  symbol: string;
  baseUri?: string;
  enumerable?: boolean;
  uriStorage?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  incremental?: boolean;
  openSeaEnabled?: boolean;
}

export function buildERC721Single(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable } = withCommonDefaults(opts);

  addBase(c, opts.name, opts.symbol);

  if (opts.baseUri) {
    addBaseURI(c, opts.baseUri);
  }

  if (opts.enumerable) {
    addEnumerable(c);
  }

  if (opts.uriStorage) {
    addURIStorage(c);
  }

  if (opts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.mintable) {
    addMintable(c, access, opts.incremental);
  }

  if (opts.openSeaEnabled) {
    addOpenSeaEnabled(c, access, opts.openSeaEnabled);
  }

  setUpgradeable(c, upgradeable, access);

  return c;
}

export function buildERC721(opts: ERC721Options): Contract[] {

  const ownableProxy = new ContractBuilder('OwnableDelegateProxy');
  const proxy = new ContractBuilder('ProxyRegistry');
  buildOwnableDelegateProxy(ownableProxy);
  buildProxyRegistry(proxy);

  const c = new ContractBuilder(opts.name);

  const { access, upgradeable } = withCommonDefaults(opts);

  addBase(c, opts.name, opts.symbol);
  addIntroComment(c);

  if (opts.baseUri) {
    addBaseURI(c, opts.baseUri);
  }

  if (opts.enumerable) {
    addEnumerable(c);
  }

  if (opts.uriStorage) {
    addURIStorage(c);
  }

  if (opts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.mintable) {
    addMintable(c, access, opts.incremental);
  }

  if (opts.openSeaEnabled) {
    addOpenSeaEnabled(c, access, opts.openSeaEnabled);
  }

  setUpgradeable(c, upgradeable, access);

  return [ownableProxy, proxy, c];
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParent(
    {
      name: 'ERC721',
      path: '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    },
    [name, symbol],
  );

  c.addOverride('ERC721', functions._beforeTokenTransfer);
  c.addOverride('ERC721', functions._burn);
  c.addOverride('ERC721', functions.tokenURI);
  c.addOverride('ERC721', supportsInterface);
}

function addBaseURI(c: ContractBuilder, baseUri: string) {
  c.addOverride('ERC721', functions._baseURI);
  c.setFunctionBody([`return ${JSON.stringify(baseUri)};`], functions._baseURI);
}

function addEnumerable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Enumerable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol',
  });

  c.addOverride('ERC721Enumerable', functions._beforeTokenTransfer);
  c.addOverride('ERC721Enumerable', supportsInterface);
}

function addURIStorage(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721URIStorage',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol',
  });

  c.addOverride('ERC721URIStorage', functions._burn);
  c.addOverride('ERC721URIStorage', functions.tokenURI);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Burnable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol',
  });
}

function addMintable(c: ContractBuilder, access: Access, incremental = false) {
  const fn = incremental ? mintFunctions.incremental : mintFunctions.regular;
  setAccessControl(c, fn, access, 'MINTER');
  if (incremental) {
    c.addUsing({
      name: 'Counters',
      path: '@openzeppelin/contracts/utils/Counters.sol',
    }, 'Counters.Counter');
    c.addVariable('Counters.Counter private _tokenIdCounter;');
    c.addFunctionCode('_safeMint(to, _tokenIdCounter.current());', fn);
    c.addFunctionCode('_tokenIdCounter.increment();', fn);
  } else {
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  }
}

function addOpenSeaEnabled(c: ContractBuilder, access: Access, enabled = false) {
  addProxyRegistryAddress(c);

  const fn = functions.isApprovedForAll;
  c.addOverride('ERC721', functions.isApprovedForAll);
  c.addFunctionCode('ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);', fn);
  c.addFunctionCode('if (address(proxyRegistry.proxies(owner)) == operator) {', fn);
  c.addFunctionCode('   return true;', fn);
  c.addFunctionCode('}', fn);
}

function addProxyRegistryAddress(c: ContractBuilder) {
  c.addConstructorArgument({
    type: "address",
    name: "_proxyRegistryAddress",
  });
  c.addVariable('address proxyRegistryAddress;');
  c.addConstructorCode('proxyRegistryAddress = _proxyRegistryAddress;')
}

function addIntroComment(c: ContractBuilder) {
  c.addVariable(`// This is the main contract, that can mint ${c.name} tokens for users`);
  c.addVariable(' ');

}

function buildOwnableDelegateProxy(c: ContractBuilder) {
  c.addVariable('// This contract is needed for XYZ');
}

function buildProxyRegistry(c: ContractBuilder) {
  c.addVariable('// This contract is needed for ABC');
  c.addVariable(' ');
  c.addVariable('mapping(address => OwnableDelegateProxy) public proxies;');
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _burn: {
    kind: 'internal' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  tokenURI: {
    kind: 'public' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
    returns: ['string memory'],
    mutability: 'view' as const,
  },

  _baseURI: {
    kind: 'internal' as const,
    args: [],
    returns: ['string memory'],
    mutability: 'pure' as const,
  },

  isApprovedForAll: {
    kind: 'public' as const,
    args: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    returns: ['bool'],
    mutability: 'view' as const,
  },
});

const mintFunctions = {
  regular: {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  incremental: {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
    ],
  },
};
