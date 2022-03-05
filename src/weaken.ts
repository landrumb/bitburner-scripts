import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  // optional second argument provides a time when the call should execute
  if (ns.args.length > 1) {
    await ns.sleep(ns.args[1] as number - Date.now())
  }
  await ns.weaken(ns.args[0] as string);
}