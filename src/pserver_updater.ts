import { NS } from '@ns'

function getMaxThreads(ns: NS, host: string, program: string): number {
  return Math.max(Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(program, "home")), 1);
}

export async function main(ns: NS): Promise<void> {
  // purchase new pservers and run hack_horse.js with them.
  const pservs = new Array<string>(25);
  let z = Math.max(2, Math.floor(Math.log2(ns.getPlayer().money / 55000)) - 1);

  const moneyThreshold = ns.getServerMaxMoney(ns.args[0] as string) * 0.75;
  const securityThreshold = ns.getServerBaseSecurityLevel(ns.args[0] as string) + 5;

  // get all existing servers, and set z to the highest power present in the existing servers.
  const existing = ns.getPurchasedServers();
  const indexRegex = /^pserv-(\d+)/mg;
  for (const server of existing) {
    const match = indexRegex.exec(server);
    if (!(match === null) && (match[1] as unknown as number) <= 24) {
      pservs[match[1] as unknown as number] = server;
      z = Math.max(z, Math.floor(Math.log2(ns.getServerMaxRam(server))));
    }
  }

  while (z <= 20) {
    const cost = (2 ** z) * 55000;
    for (let i = 0; i < 25; i++) {
      // wait for adequate funds
      while (ns.getPlayer().money < cost) {
        await ns.sleep(1000); // wait 1 second
      }

      // purchase server
      ns.deleteServer(pservs[i])
      pservs[i] = ns.purchaseServer(`pserv-${i}-${2 ** z}GB`, 2 ** z);

      // run hack_horse.js on server
      await ns.scp("hack_horse.js", "home", pservs[i]);
      ns.exec("hack_horse.js", pservs[i], getMaxThreads(ns, pservs[i], "hack_horse.js"), ns.args[0], moneyThreshold, securityThreshold);
    }
    z++;
  }


}