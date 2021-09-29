import test from 'ava';

import { zipContract } from './zip';
import { buildERC721Single } from './erc721';
import { generateOptions } from './generate/sources';
import { buildGeneric } from './build-generic';

test('erc20 basic', t => {
  const c = buildERC721Single({ name: 'MyToken', symbol: 'MTK' });
  const zip = zipContract(c);
  const files = Object.values(zip.files).map(f => f.name).sort();

  t.deepEqual(files, [
    '@openzeppelin/',
    '@openzeppelin/contracts/',
    '@openzeppelin/contracts/README.md',
    '@openzeppelin/contracts/token/',
    '@openzeppelin/contracts/token/ERC20/',
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/token/ERC20/IERC20.sol',
    '@openzeppelin/contracts/token/ERC20/extensions/',
    '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol',
    '@openzeppelin/contracts/utils/',
    '@openzeppelin/contracts/utils/Context.sol',
    'MyToken.sol',
  ]);
});
