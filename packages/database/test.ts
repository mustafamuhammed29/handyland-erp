import { PrismaClient } from '@prisma/client';
import { addPartToRepair, updateRepairPartQuantity } from '../../apps/admin/app/actions/repair';
import { createPart } from '../../apps/admin/app/actions/inventory';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("=== STARTING TEST ===");
    
    // 1. Add part to stock
    console.log("1. Creating part...");
    const partRes = await createPart({
      name: "Test Screen X",
      category: "SCREEN",
      quantity: 10,
      price: 100,
      minQuantity: 2
    });
    console.log("Create Part Result:", partRes);
    const partId = partRes.part.id;

    // Create a dummy repair to attach to
    const customer = await prisma.customer.create({
      data: { firstName: "Test", lastName: "Customer" }
    });
    const repair = await prisma.repair.create({
      data: { ticketNumber: "T-TEST", customerId: customer.id, status: "NEW" }
    });

    // 2. Consume it through a repair
    console.log("2. Adding 2 parts to repair...");
    const addRes = await addPartToRepair(repair.id, partId, 2);
    console.log("Add Part to Repair Result:", addRes);
    const repairPartId = addRes.repairPart.id;

    const partAfterAdd = await prisma.part.findUnique({ where: { id: partId } });
    console.log("Stock after consumption (Expected 8):", partAfterAdd?.quantity);

    // 3. Edit quantity afterward and verify delta
    console.log("3. Updating repair part quantity from 2 to 3 (Delta +1)...");
    const updateRes = await updateRepairPartQuantity(repairPartId, 3);
    console.log("Update Repair Part Result:", updateRes);

    const partAfterUpdate = await prisma.part.findUnique({ where: { id: partId } });
    console.log("Stock after update (Expected 7):", partAfterUpdate?.quantity);
    
    // Check transactions
    const txs = await prisma.inventoryTransaction.findMany({ where: { partId }, orderBy: { createdAt: "asc" } });
    console.log("Transactions logged:");
    txs.forEach(tx => console.log(`- ${tx.type}: Change ${tx.quantityChange}, Old: ${tx.previousQuantity}, New: ${tx.newQuantity}`));

    console.log("=== TEST COMPLETED ===");
  } catch (e) {
    console.error("Test failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
