import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const GlobalTarget = ns.args[0] as string;
  const GlobalMoneyThresh = (ns.args[1] as number) * 0.75;
  const GlobalSecurityThresh = (ns.args[2] as number) + 5;
  while (true) {
    if (ns.getServerSecurityLevel(GlobalTarget) > GlobalSecurityThresh) {
      await ns.weaken(GlobalTarget);
    } else if (ns.getServerMoneyAvailable(GlobalTarget) < GlobalMoneyThresh) {
      await ns.grow(GlobalTarget);
    } else {
      await ns.hack(GlobalTarget);
    }
  }
}