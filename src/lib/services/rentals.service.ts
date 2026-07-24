import { db } from "@/db";
import { equipments, equipmentRentals } from "@/db/schema";
import { getUserByClerkId } from "@/db/queries";
import { and, eq, or, lte, gte } from "drizzle-orm";
import { EquipmentRental } from "@/db/types";
import { ActionErrorCode } from "@/lib/action-response";

export interface CreateRentalInput {
  clerkId: string;
  equipmentId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

class ServiceError extends Error {
  code: ActionErrorCode;
  constructor(message: string, code: ActionErrorCode) {
    super(message);
    this.code = code;
  }
}

function validateRentalDates(startDate: string, endDate: string) {
  const today = new Date().toISOString().split('T')[0];
  if (startDate < today) {
    throw new ServiceError("No puedes reservar en el pasado.", "INVALID_DATES");
  }

  if (endDate < startDate) {
    throw new ServiceError("La fecha final debe ser igual o posterior a la inicial.", "INVALID_DATES");
  }
}

function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

async function getAuthenticatedUser(clerkId: string) {
  const user = await getUserByClerkId(clerkId);
  if (!user) {
    throw new ServiceError("Usuario no encontrado o no autorizado.", "UNAUTHORIZED");
  }
  return user;
}

// Note: tx is any here to avoid importing complex generic Drizzle transaction types, 
// but in a strict environment you would extract the Tx type from Drizzle.
async function lockAndValidateEquipment(tx: any, equipmentId: number) {
  const [equipment] = await tx
    .select()
    .from(equipments)
    .where(eq(equipments.id, equipmentId))
    .for('update');

  if (!equipment) {
    throw new ServiceError("El equipamiento no existe.", "EQUIPMENT_NOT_FOUND");
  }

  if (!equipment.isAvailable) {
    throw new ServiceError("El equipamiento no está disponible para alquilar.", "EQUIPMENT_UNAVAILABLE");
  }

  return equipment;
}

async function ensureNoOverlappingRentals(tx: any, equipmentId: number, startDate: string, endDate: string) {
  const overlappingRentals = await tx
    .select()
    .from(equipmentRentals)
    .where(
      and(
        eq(equipmentRentals.equipmentId, equipmentId),
        lte(equipmentRentals.startDate, endDate),
        gte(equipmentRentals.endDate, startDate),
        or(
          eq(equipmentRentals.status, 'reserved'),
          eq(equipmentRentals.status, 'delivered'),
          eq(equipmentRentals.status, 'pending_payment')
        )
      )
    );

  if (overlappingRentals.length > 0) {
    throw new ServiceError("El equipo ya se encuentra reservado en esas fechas.", "EQUIPMENT_UNAVAILABLE");
  }
}

export async function createRentalBooking(input: CreateRentalInput): Promise<EquipmentRental> {
  // Validations and initial setup
  validateRentalDates(input.startDate, input.endDate);
  const rentalDays = calculateRentalDays(input.startDate, input.endDate);
  const user = await getAuthenticatedUser(input.clerkId);

  // Database Transaction
  return await db.transaction(async (tx) => {

    const equipment = await lockAndValidateEquipment(tx, input.equipmentId);
    await ensureNoOverlappingRentals(tx, input.equipmentId, input.startDate, input.endDate);
    const totalPrice = (parseFloat(equipment.dailyPrice) * rentalDays).toFixed(2);
    const depositAmount = parseFloat(equipment.deposit).toFixed(2);

    const [newRental] = await tx
      .insert(equipmentRentals)
      .values({
        userId: user.id,
        equipmentId: equipment.id,
        startDate: input.startDate,
        endDate: input.endDate,
        status: "pending_payment",
        totalPrice: totalPrice,
        depositAmount: depositAmount
      })
      .returning();

    return newRental;
  });
}
