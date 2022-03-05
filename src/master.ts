import { NS } from '@ns';

let owned = new Set<string>();
let next_hack_level = Infinity;
let next_hack_ports = Infinity;

async function recursiveRootAccess(ns: NS, host: string, level: number, ports: number): Promise<void> {
  const neighbors = await ns.scan(host);

  for (const neighbor of neighbors) {
    const reqHackingLevel = ns.getServerRequiredHackingLevel(neighbor);
    const reqPorts = ns.getServerNumPortsRequired(neighbor);

    if (ns.hasRootAccess(neighbor)) {
      if (owned.has(neighbor)) {
        continue;
      } else {
        // ns.tprint(`root access to ${neighbor} discovered`);
        await ns.scp(["hack.js", "weaken.js", "grow.js"], "home", neighbor);
        owned.add(neighbor);
        await recursiveRootAccess(ns, neighbor, level, ports);
      }
    } else if (reqHackingLevel <= level && reqPorts <= ports) {
      if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(neighbor);
      }
      if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(neighbor);
      }
      if (ns.fileExists("RelaySMTP.exe", "home")) {
        ns.relaysmtp(neighbor);
      }
      if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(neighbor);
      }
      if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(neighbor);
      }
      ns.nuke(neighbor);
      ns.tprint(`${neighbor} nuked`);
      await ns.scp(["hack.js", "weaken.js", "grow.js"], "home", neighbor);
      owned.add(neighbor);
      await recursiveRootAccess(ns, neighbor, level, ports);
    } else {
      if (next_hack_level > reqHackingLevel && reqHackingLevel > 1) {
        next_hack_level = Math.min(next_hack_level, reqHackingLevel);
        next_hack_ports = Math.min(next_hack_ports, reqPorts);
      }
    }
  }
}

function getMaxThreads(ns: NS, host: string, program: string, max?: boolean | undefined): number {
  return Math.max(Math.floor((ns.getServerMaxRam(host) - (max === undefined ? ns.getServerUsedRam(host) : 0)) / ns.getScriptRam(program, "home")), 1);
}

function distribute(ns: NS, program: string, threads: number, args: string): number {
  let remaining_threads = threads;
  for (const host of owned) {
    const max_threads = getMaxThreads(ns, host, program);
    const num_threads = Math.min(remaining_threads, max_threads);
    if (num_threads > 0) {
      if (ns.exec(program, host, num_threads, args)) {
        remaining_threads -= num_threads;
      }
    }
  }
  return remaining_threads;
}

// getting number of ports that can currently be opened
function getPortsAvailable(ns: NS): number {
  return ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"].reduce(
    (previousValue, currentValue) => previousValue + (ns.fileExists(currentValue, "home") as unknown as number),
    0
  );
}

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string;
  const moneyThreshold = ns.getServerMaxMoney(target);
  const securityThreshold = ns.getServerMinSecurityLevel(target);
  let money, weakenThreads, hackThreads, growThreads;

  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerMaxRam");

  owned.add("home");
  await recursiveRootAccess(ns, "home", ns.getHackingLevel(), getPortsAvailable(ns));
  ns.tprint(`Next hack at level ${next_hack_level} with ${next_hack_ports} ports`);

  // starting pserver_updater.js
  // ns.exec("pserver_updater.js", "home", 1, ns.args[0] as string);

  while (true) {
    const level = ns.getHackingLevel();
    const ports = getPortsAvailable(ns);
    // ns.tprint(`hack level: ${level}, ports: ${ports}`);

    // ns.scriptKill("master_waiter.js", "home")

    // if next hack is available, do it
    if (true) {//(ns.getHackingLevel() >= next_hack_level && getPortsAvailable(ns) >= next_hack_ports) {
      next_hack_level = Infinity;
      next_hack_ports = Infinity;
      owned = new Set<string>();

      // getting root access on all possible computers
      owned.add("home");
      await recursiveRootAccess(ns, "home", level, ports);
      // ns.tprint(`Next hack at level ${next_hack_level} with ${next_hack_ports} ports`);
    }

    // for (const host of owned) {
    //   const contracts = ns.ls(host, ".cct");
    //   if (contracts.length > 0) {
    //     ns.tprint(`Contract on ${host}: ${contracts}`)
    //   }
    // }

    // hacking target from all owned computers  
    money = Math.max(1, ns.getServerMoneyAvailable(target));
    weakenThreads = Math.ceil((ns.getServerSecurityLevel(target) - securityThreshold) / ns.weakenAnalyze(1));
    hackThreads = Math.ceil((ns.hackAnalyzeThreads(target, money / 2)));
    growThreads = Math.ceil(ns.growthAnalyze(target, (moneyThreshold / money)));
    // ownedThreads = [...owned].reduce((previousValue, currentValue) => previousValue + getMaxThreads(ns, currentValue, "grow.js"), 0);

    if (ns.getServerSecurityLevel(target) > securityThreshold) {
      ns.print(`Weakening ${target} with ${weakenThreads} threads: ${ns.getWeakenTime(target) / 1000}s`);
      if (distribute(ns, "weaken.js", weakenThreads, target) == weakenThreads) {
        await ns.sleep(ns.getWeakenTime(target) + 5000);
      }
    } else if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
      ns.print(`Growing ${target} with ${growThreads} threads: ${ns.getGrowTime(target) / 1000}s`);
      (distribute(ns, "grow.js", growThreads, target) == growThreads) && await ns.sleep(ns.getGrowTime(target) + 5000);
    } else {
      ns.print(`Hacking ${target} with ${hackThreads} threads: ${ns.getHackTime(target) / 1000}s`);
      (distribute(ns, "hack.js", hackThreads, target) == hackThreads) && await ns.sleep(ns.getHackTime(target) + 5000);
    }

    // for (const host of owned) {
    //   const max_threads = getMaxThreads(ns, host, "hack_horse.js");
    //   // ns.tprint(`running with ${max_threads} threads on ${host}`);
    //   await ns.scp("hack_horse.js", "home", host);
    //   await ns.exec("hack_horse.js", host, max_threads, target, moneyThreshold, securityThreshold);
    // }
  }
  // spawning master_waiter.js
  // ns.spawn("master_waiter.js", 1, target, next_hack_level as unknown as string, next_hack_ports as unknown as string);
}