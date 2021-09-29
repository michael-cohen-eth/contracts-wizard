import { version as contractsVersion } from "@openzeppelin/contracts/package.json";
import type { Contract } from "./contract";
import { printContract, printContracts } from "./print";

export function printContractVersioned(contract: Contract): string {
  return printContract(contract, {
    transformImport: p =>
      p.replace(/^@openzeppelin\/contracts(-upgradeable)?/, `$&@${contractsVersion}`),
  });
}

export function printContractsVersioned(contracts: Contract[]): string {
  return printContracts(contracts, {
    transformImport: p =>
      p.replace(/^@openzeppelin\/contracts(-upgradeable)?/, `$&@${contractsVersion}`),
  });
}


