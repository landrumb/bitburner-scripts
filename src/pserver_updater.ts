import { NS } from '@ns'

function getMaxThreads(ns: NS, host: string, program: string): number {
  return Math.max(Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(program, "home")), 1);
}

export async function main(ns: NS): Promise<void> {
  // purchase new pservers and run hack_horse.js with them.
  const pservs = new Array<string>(25);
  let z = Math.min(Math.max(2, Math.floor(Math.log2(ns.getPlayer().money / 55000)) - 1), 20);

  const moneyThreshold = ns.getServerMaxMoney(ns.args[0] as string);
  const securityThreshold = ns.getServerMinSecurityLevel(ns.args[0] as string);

  ns.disableLog("sleep");

  // get all existing servers, and set z to the highest power present in the existing servers.
  const existing = ns.getPurchasedServers();
  const indexRegex = /^pserv-(\d+)/m;
  for (const server of existing) {
    const match = indexRegex.exec(server);

    if (!(match === null) && (parseInt(match[1]) as number) <= 24) {
      pservs[match[1] as unknown as number] = server;
      z = Math.max(z, Math.floor(Math.log2(ns.getServerMaxRam(server))));
    }
  }
  // ns.tprint(ns.getPurchasedServers());
  // ns.tprint(pservs);

  while (z <= 20) {
    const cost = (2 ** z) * (55000 + 5000);
    for (let i = 0; i < 25; i++) {
      // wait for adequate funds
      while (ns.getPlayer().money < cost) {
        ns.print(`Waiting for ${cost.toLocaleString()} money`);
        await ns.sleep(1000 * 60); // wait 60 seconds
      }

      // if ((pservs[i] !== undefined && pservs[i].length < 2)) {
      //   continue;
      // }

      if (pservs[i] !== undefined && ns.getServerMaxRam(pservs[i]) >= 2 ** z) {
        continue;
      }

      // purchase server
      if (!(pservs[i] === undefined || pservs[i] == "home")) {
        ns.killall(pservs[i])
        ns.deleteServer(pservs[i])
      }
      pservs[i] = ns.purchaseServer(`pserv-${i}-${(2 ** z).toLocaleString()}GB`, 2 ** z);

      // run batching.js on server
      await ns.scp(["batching.js", "grow.js", "hack.js", "weaken.js"], "home", pservs[i]);
      ns.exec("batching.js", pservs[i], 1, ns.args[0]);


    }
    z++;
  }


}