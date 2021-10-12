import { ERC721Options, buildERC721 } from './erc721';
import { ERC1155Options, buildERC1155 } from './erc1155';
import { GovernorOptions, buildGovernor } from './governor';

export interface KindedOptions {
  ERC721:   { kind: 'ERC721' }   & ERC721Options;
  ERC1155:  { kind: 'ERC1155' }  & ERC1155Options;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {

    case 'ERC721':
      return buildERC721(opts);

    case 'ERC1155':
      return buildERC1155(opts);

    default:
      const _: never = opts;
      throw new Error('Unknown ERC');
  }
}
