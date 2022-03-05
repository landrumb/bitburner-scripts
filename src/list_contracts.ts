import { NS } from '@ns'

const servers = ["ecorp", "megacorp", "b-and-a", "blade", "nwo", "clarkinc", "omnitek", "4sigma", "kuai-gong", "fulcrumtech", "fulcrumassets", "stormtech",
  "defcomm", "infocomm", "helios", "vitalife", "icarus", "univ-energy", "titan-labs", "microdyne", "taiyang-digital",
  "galactic-cyber", "aerocorp", "omnia", "zb-def", "applied-energetics", "solaris", "deltaone", "global-pharm", "nova-med", "zeus-med", "unitalife", "lexo-corp", "rho-construction",
  "alpha-ent", "aevum-police", "rothman-uni", "zb-institute", "summit-uni", "syscore", "catalyst", "the-hub", "comptek", "netlink", "johnson-ortho", "n00dles",
  "foodnstuff", "sigma-cosmetics", "joesguns", "zer0", "nectar-net", "neo-net", "silver-helix", "hong-fang-tea", "harakiri-sushi", "phantasy", "max-hardware", "omega-net", "crush-fitness",
  "iron-gym", "millenium-fitness", "powerhouse-fitness", "snap-fitness", "run4theh111z", "I.I.I.I", "avmnite-02h", "CSEC", "The-Cave", "w0r1d_d43m0n", "."];

export async function main(ns: NS): Promise<void> {
  for (const host of servers) {
    if (!ns.hasRootAccess(host)) { continue; }

    const contracts = ns.ls(host, ".cct");
    for (const contract of contracts) {
      const type = ns.codingcontract.getContractType(contract, host);
      ns.tprint(`${type} contract ${contract} on ${host}`);
    }
  }
  ns.tprint("Done");
}