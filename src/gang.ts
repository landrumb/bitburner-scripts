import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  for (const member of ns.gang.getMemberNames()) {
    for (const equip of ns.gang.getEquipmentNames()) {
      ns.gang.purchaseEquipment(member, equip);
    }
  }
}