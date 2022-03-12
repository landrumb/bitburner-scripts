import { NS } from '@ns'

const delay = 5000


function getMaxThreads(ns: NS, host: string, program: string): number {
  return Math.max(Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(program, "home")), 1);
}

function growthAnalyze(ns: NS, target: string, init_money: number, cores = 1) {
  const max_money = ns.getServerMaxMoney(target);
  if (init_money >= max_money) { return 0; }

  let threads = 1000;
  let prev = threads;

  for (let i = 0; i < 20; ++i) {
    const factor = max_money / Math.min(init_money + threads, max_money - 1);
    threads = ns.growthAnalyze(target, factor, cores);
    if (Math.ceil(threads) == Math.ceil(prev)) { break; }
    prev = threads;
  }

  return Math.ceil(Math.max(threads, prev));
}

function distribute(ns: NS, program: string, threads: number, args: string): number {
  let remaining_threads = threads;
  const host = ns.getHostname();
  const max_threads = getMaxThreads(ns, host, program);
  const num_threads = Math.min(remaining_threads, max_threads);
  if (num_threads > 0) {
    if (ns.exec(program, host, num_threads, args)) {
      remaining_threads -= num_threads;
    }
  }

  return remaining_threads;
}
// function weaken(ns: NS, host: string, threads: number, target:string): void {
//   ns.exec(host, "weaken.js", threads, target);
// }

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const host = ns.getHostname();
  const max_money = ns.getServerMaxMoney(target)

  if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
    const threads = Math.ceil((ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)) / ns.weakenAnalyze(1));
    if (ns.exec("weaken.js", host, threads, target)) {
      const wait = ns.getWeakenTime(target);
      ns.tprint(`${target} weakened with ${threads}, finishes at ${(new Date(Date.now() + wait)).toLocaleTimeString()}`);
      await ns.sleep(wait);
    } else {
      ns.tprint(`${target} failed to weaken with ${threads} threads`);
    }
  }

  ns.tprint(`${target} has security level ${ns.getServerSecurityLevel(target)} / ${ns.getServerMinSecurityLevel(target)}`);

  if (ns.getServerMoneyAvailable(target) < max_money) {
    const threads = Math.ceil(ns.growthAnalyze(target, (max_money / ns.getServerMoneyAvailable(target))));
    if (ns.exec("grow.js", host, threads, target)) {
      const wait = ns.getGrowTime(target);
      ns.tprint(`${target} grown with ${threads}, finishes at ${(new Date(Date.now() + wait)).toLocaleTimeString()}`);
      await ns.sleep(wait);
    } else {
      ns.tprint(`${target} failed to grow with ${threads} threads`);
    }
  }

  ns.tprint(`${target} has available money ${ns.getServerMoneyAvailable(target).toLocaleString()} / ${ns.getServerMaxMoney(target).toLocaleString()}`);

  const moneyThreshold = Math.max(1, ns.getServerMoneyAvailable(target));
  const securityThreshold = ns.getServerSecurityLevel(target);

  const money = Math.max(1, ns.getServerMoneyAvailable(target));
  const weakenThreads = Math.ceil((ns.getServerSecurityLevel(target) - securityThreshold) / ns.weakenAnalyze(1));
  const hackThreads = Math.ceil((ns.hackAnalyzeThreads(target, money / 2)));
  const growThreads = Math.ceil(ns.growthAnalyze(target, (moneyThreshold / money)));
  // ownedThreads = [...owned].reduce((previousValue, currentValue) => previousValue + getMaxThreads(ns, currentValue, "grow.js"), 0);


  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) {
      ns.print(`Weakening ${target} with ${weakenThreads} threads: ${ns.getWeakenTime(target) / 1000}s`);
      if (distribute(ns, "weaken.js", weakenThreads, target) == weakenThreads) {
        await ns.sleep(ns.getWeakenTime(target));
      }
    } else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
      ns.print(`Growing ${target} with ${growThreads} threads: ${ns.getGrowTime(target) / 1000}s`);
      (distribute(ns, "grow.js", growThreads, target) == growThreads) && await ns.sleep(ns.getGrowTime(target));
    } else {
      ns.print(`Hacking ${target} with ${hackThreads} threads: ${ns.getHackTime(target) / 1000}s`);
      (distribute(ns, "hack.js", hackThreads, target) == hackThreads) && await ns.sleep(ns.getHackTime(target));
    }
  }
}