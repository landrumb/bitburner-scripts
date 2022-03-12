import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const z = 18;
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

    const server = ns.purchaseServer("pserv", 2 ** z);
    ns.tprint(server == "")
    // run batching.js on server

    await ns.scp(["batching.js", "grow.js", "hack.js", "weaken.js"], "home", server);
    // ns.exec("batching.js", server, 1, ns.args[0]);


  }
}