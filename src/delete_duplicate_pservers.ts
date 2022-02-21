import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const pservs = ns.getPurchasedServers();
  const ends_in_digit_regex = new RegExp(/\d+$/);

  for (const pserv of pservs) {
    ends_in_digit_regex.test(pserv) ? ns.killall(pserv) && ns.deleteServer(pserv) : 0;
  }
}