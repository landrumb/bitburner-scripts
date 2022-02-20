import { NS } from '@ns';

const owned = new Set<string>();
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
        ns.tprint(`root access to ${neighbor} discovered`);
        owned.add(neighbor);
        await recursiveRootAccess(ns, neighbor, level, ports);
      }
    } else if (reqHackingLevel <= level && reqPorts <= ports) {
      if (ports >= 1) {
        ns.brutessh(neighbor);
      }
      if (ports >= 2) {
        ns.ftpcrack(neighbor);
      }
      if (ports >= 3) {
        ns.relaysmtp(neighbor);
      }
      if (ports >= 4) {
        ns.httpworm(neighbor);
      }
      if (ports >= 5) {
        ns.sqlinject(neighbor);
      }
      ns.nuke(neighbor);
      ns.tprint(`${neighbor} nuked`);
      owned.add(neighbor);
      await recursiveRootAccess(ns, neighbor, level, ports);
    } else {
      next_hack_level = Math.min(next_hack_level, reqHackingLevel);
      next_hack_ports = Math.min(next_hack_ports, reqPorts);
    }
  }
}

function getMaxThreads(ns: NS, host: string, program: string): number {
  return Math.max(Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(program, "home")), 1);
}

export async function main(ns: NS): Promise<void> {
  const level = ns.getHackingLevel();
  // getting number of ports that can currently be opened
  const ports = ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"].reduce(
    (previousValue, currentValue) => previousValue + (ns.fileExists(currentValue, "home") as unknown as number),
    0
  );
  ns.tprint(`hack level: ${level}, ports: ${ports}`);

  // getting root access on all possible computers
  owned.add("home");
  await recursiveRootAccess(ns, "home", level, ports);
  ns.tprint(`Next hack at level ${next_hack_level} with ${next_hack_ports} ports`);

  // hacking target from all owned computers  
  const target = ns.args[0].toString();
  const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
  const securityThreshold = ns.getServerBaseSecurityLevel(target) + 5;

  for (const host of owned) {
    const max_threads = getMaxThreads(ns, host, "hack_horse.js");
    // ns.tprint(`running with ${max_threads} threads on ${host}`);
    await ns.scp("hack_horse.js", "home", host);
    await ns.exec("hack_horse.js", host, max_threads, target, moneyThreshold, securityThreshold);
  }

  // spawning master_waiter.js
  ns.spawn("master_waiter.js", 1, target, next_hack_level as unknown as string, next_hack_ports as unknown as string);
}