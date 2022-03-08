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

// Largest Prime Factor
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

function maxSubarraySumIndices(arr: number[]): Array<any> {
  let maxSum = [-Infinity, 0, 0];
  let currentSum = [-Infinity, 0, 0];
  for (let i = 0; i < arr.length; i++) {
    currentSum = arr[i] > currentSum[0] + arr[i] ? [arr[i], i, i] : [currentSum[0] + arr[i], currentSum[1], i];
    maxSum = currentSum[0] > maxSum[0] ? currentSum : maxSum;
  }
  return maxSum;
}

// Total Ways to Sum (currently doesn't work)
function p_k(n: number, k: number): number {
  if (n < 0) { return 0; }
  if (n <= 1) { return 1; }
  if (k <= 1) { return 1; }

  return p_k(n - 1, k - 1) + p_k(n - k, k);
}

export function partitions(n: number): number {
  if (n <= 1) { return 1; }
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    sum += p_k(n, k);
  }
  return sum;
}


// Array Jumping Game
function arrJumpGame(arr: number[]): number {
  let max = arr[0];
  const current = 0;
  for (let i = 0; i <= max; i++) {
    max = Math.max(max, i + arr[i]);
    if (max >= arr.length - 1) { return 1; }
  }
  return 0;
}


// Merge Overlapping Intervals
function mergeIntervals(intervals: Array<Array<number>>): Array<Array<number>> {
  const sorted = intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const interval of sorted) {
    if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {
      merged.push(interval);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
    }
  }
  return merged;
}


// Algorithmic Trading

/**
 * Converts an array of stock prices into an array of deltas, each delta representing a continuous run of increasing or decreasing prices
 */
export function deltize(arr: Array<number>): Array<number> {
  const deltas = [0];
  let i = 0;
  let increasing = arr[0] <= arr[1];
  for (let j = 1; j < arr.length - 1; j++) {
    if (arr[j] == 0) { continue; }

    if (increasing == arr[j - 1] < arr[j]) {
      deltas[i] += arr[j] - arr[j - 1];
    } else {
      increasing = !increasing;
      deltas.push(arr[j] - arr[j - 1]);
      i++;
    }
  }
  return deltas;
}

function algTrading1(prices: Array<number>): number {
  const deltas = deltize(prices);
  const maxDelta = maxSubarraySum(deltas);

  return maxDelta;
}

function algTrading2(prices: Array<number>): number {
  const deltas = deltize(prices);

  return deltas.reduce((prev, curr) => prev + Math.max(0, curr), 0);
}

function algTrading3(prices: Array<number>): number {
  const deltas = deltize(prices);
  const [maxDelta, start, end] = maxSubarraySumIndices(deltas);

  return maxDelta - maxSubarraySum(deltas.slice(start, end).map(n => -1 * n));
}

function algTrading4(input: Array<any>): number {
  const [k, prices] = input;
  const deltas = deltize(prices);
  const maxDelta = maxSubarraySum(deltas);
  let positiveRuns = 0;

  for (const n of deltas) {
    if (n > 0) {
      positiveRuns++;
    }
  }

  if (positiveRuns <= k) {
    return algTrading3(prices);
  }

  if (k >= 2) {
    const minIndex = deltas.indexOf(Math.max(...deltas.map(d => d > 0 ? 0 : d))); // index of the negative run with the smallest magnitude
    const preIndex = Math.max(0, minIndex - 1);
    const postIndex = Math.min(deltas.length - 1, minIndex + 1);

    const modifiedDeltas = deltas.slice(0, preIndex);
    modifiedDeltas.push(deltas.slice(preIndex, postIndex + 1).reduce((prev, curr) => prev + curr, 0));
    modifiedDeltas.concat(deltas.slice(postIndex + 1));
    return algTrading4([modifiedDeltas, k]);
  } else {
    return maxDelta;
  }
}


// Unique Paths in a Grid

function binom(m: number, n: number): number {
  if (n === 0 || n === m) { return 1; }
  if (n > m) { return 0; }
  return binom(m - 1, n - 1) + binom(m - 1, n);
}

function uniquePaths1(input: Array<number>): number {
  const [m, n] = input;

  return binom(m + n, n);
}

/**
 * gives the number of unique D/R paths that pass through all the provided points, points being [row, column] coordinate pair arrays
 */
function paths_between(...points: Array<Array<number>>): number {
  points.sort((a, b) => a[0] - b[0]);

  // ensuring there's actually a path between all the points
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i][1] > points[i + 1][1]) {
      return 0;
    }
  }

  let paths = 1;
  for (let i = 0; i < points.length - 1; i++) {
    paths *= uniquePaths1([points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]]);
  }

  return paths;
}

export function combinations<T>(elements: Array<T>): Array<Array<T>> {
  if (elements.length === 0) { return [[]]; }

  const result = [];
  const childCombinations = combinations(elements.slice(1));
  result.push(...childCombinations.map(c => [elements[0], ...c]));
  result.push(...childCombinations);
  return result;
}

function uniquePaths2(board: Array<Array<number>>): number {
  const [m, n] = [board.length, board[0].length];
  const points = [];
  let paths = 0;

  // build array of obstacles
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === 1) {
        points.push([i, j]);
      }
    }
  }

  // count paths with inclusion-exclusion principle
  for (const i of combinations(points)) {
    paths += i.length % 2 < Number.EPSILON ? paths_between([0, 0], [m - 1, n - 1], ...i) : -1 * paths_between([0, 0], [m - 1, n - 1], ...i);
  }

  return Math.round(paths);
}

const solution_functions: { [key: string]: Solver } = {
  "Find Largest Prime Factor": largestPrimeFactor,
  "Subarray with Maximum Sum": maxSubarraySum,
  "Array Jumping Game": arrJumpGame,
  "Merge Overlapping Intervals": mergeIntervals,
  "Algorithmic Stock Trader I": algTrading1,
  "Algorithmic Stock Trader II": algTrading2,
  "Algorithmic Stock Trader III": algTrading3,
  "Algorithmic Stock Trader IV": algTrading4,
  "Unique Paths in a Grid I": uniquePaths1,
  "Unique Paths in a Grid II": uniquePaths2,
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