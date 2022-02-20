import { NS } from '@ns'

function getPortsAvailable(ns: NS): number {
  return ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"].reduce(
    (previousValue, currentValue) => previousValue + (ns.fileExists(currentValue, "home") as unknown as number),
    0
  );
}

export async function main(ns: NS): Promise<void> {
  // waits until next valid hack to respawn master.js
  const next_hack_level = ns.args[1] as number;
  const next_hack_ports = ns.args[2] as number;

  while (ns.getHackingLevel() < next_hack_level || getPortsAvailable(ns) < next_hack_ports) {
    await ns.sleep(1000); // 1 second
  }
  ns.spawn("master.js", 1, ns.args[0] as string);
}
