import { NS } from '@ns'

const servers = ["ecorp", "megacorp", "b-and-a", "blade", "nwo", "clarkinc", "omnitek", "4sigma", "kuai-gong", "fulcrumtech", "fulcrumassets", "stormtech",
  "defcomm", "infocomm", "helios", "vitalife", "icarus", "univ-energy", "titan-labs", "microdyne", "taiyang-digital",
  "galactic-cyber", "aerocorp", "omnia", "zb-def", "applied-energetics", "solaris", "deltaone", "global-pharm", "nova-med", "zeus-med", "unitalife", "lexo-corp", "rho-construction",
  "alpha-ent", "aevum-police", "rothman-uni", "zb-institute", "summit-uni", "syscore", "catalyst", "the-hub", "comptek", "netlink", "johnson-ortho", "n00dles",
  "foodnstuff", "sigma-cosmetics", "joesguns", "zer0", "nectar-net", "neo-net", "silver-helix", "hong-fang-tea", "harakiri-sushi", "phantasy", "max-hardware", "omega-net", "crush-fitness",
  "iron-gym", "millenium-fitness", "powerhouse-fitness", "snap-fitness", "run4theh111z", "I.I.I.I", "avmnite-02h", "CSEC", "The-Cave", "w0r1d_d43m0n", "."];

interface Solver {
  (a: any): any;
}

function primeFactors(n: number): number[] {
  const factors = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d += 1;
  }
  return factors;
}

function largestPrimeFactor(n: number): number {
  const factors = primeFactors(n);
  return factors[factors.length - 1];
}

// Subarray with Maximum Sum
function maxSubarraySum(arr: number[]): number {
  let maxSum = -Infinity;
  let currentSum = -Infinity;
  for (const n of arr) {
    currentSum = Math.max(n, currentSum + n);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}

// Total Ways to Sum
export function partitions(n: number): number {
  if (n <= 1) { return 1; }
  let sum = 0;
  for (let k = 1; k * (3 * k - 1) / 2 <= n; k++) {
    sum += ((-1) ** (k + 1)) * partitions(n - k * (3 * k - 1) / 2);
  }
  return sum;
}

const solution_functions: { [key: string]: Solver } = {
  "Find Largest Prime Factor": largestPrimeFactor,
  "Subarray with Maximum Sum": maxSubarraySum
};

export async function main(ns: NS): Promise<void> {
  const failed = new Set<string>();

  while (true) {
    for (const server of servers) {
      if (!ns.hasRootAccess(server)) {
        continue;
      }

      const files = ns.ls(server, ".cct");

      if (files.length < 1) {
        continue;
      }

      for (const file of files) {
        const type = ns.codingcontract.getContractType(file, server);
        if (!(type in solution_functions) || file in failed) {
          continue;
        }

        const data = ns.codingcontract.getData(file, server);
        const solution = solution_functions[type](data);
        const reward = ns.codingcontract.attempt(solution, file, server, { returnReward: true }) as string;
        if (reward.length > 0) {
          ns.tprint(`${type} contract on ${server} solved with ${solution} and got ${reward}`);
        } else {
          ns.tprint(`${type} contract with ${data} on ${server} FAILED with ${solution}`);
          failed.add(file);
        }
      }

    }

    await ns.sleep(1000 * 5);
  }
}