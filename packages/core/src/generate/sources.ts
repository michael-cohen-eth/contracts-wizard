import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { generateERC721Options } from './erc721';
import { generateERC1155Options } from './erc1155';
import { buildGeneric, GenericOptions } from '../build-generic';
import { printContracts } from '../print';

type Subset = 'all' | 'only-maximal';

export function* generateOptions(subset: Subset): Generator<GenericOptions> {
  const forceTrue = subset === 'only-maximal';


  for (const kindOpts of generateERC721Options(forceTrue)) {
    yield { kind: 'ERC721', ...kindOpts };
  }

  for (const kindOpts of generateERC1155Options(forceTrue)) {
    yield { kind: 'ERC1155', ...kindOpts };
  }
}

// If max = true, will only generate the "maximal" contracts, i.e. those that include all features.
export async function writeGeneratedSources(dir: string, subset: Subset): Promise<void> {
  await fs.mkdir(dir, { recursive: true });

  for (const opts of generateOptions(subset)) {
    const source = printContracts(buildGeneric(opts));

    const name = crypto
      .createHash('sha1')
      .update(JSON.stringify(opts))
      .digest()
      .toString('hex');

    await fs.writeFile(path.format({ dir, name, ext: '.sol' }), source);
  }
}
