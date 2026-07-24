"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { ActionResponse } from "@/lib/action-response";
import { EquipmentRental } from "@/db/types";
import { createRentalBooking } from "@/lib/services/rentals.service";

// Zod schema to strictly validate input from the UI
const createRentalSchema = z.object({
  equipmentId: z.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Debe ser YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Debe ser YYYY-MM-DD"),
});

export async function createRentalAction(
  formData: FormData
): Promise<ActionResponse<EquipmentRental>> {

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesión para alquilar equipamiento.",
      },
    };
  }

  const rawData = {
    equipmentId: Number(formData.get("equipmentId")),
    startDate: formData.get("startDate")?.toString(),
    endDate: formData.get("endDate")?.toString(),
  };

  const parsed = createRentalSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos de alquiler inválidos.",
        details: parsed.error.format(),
      },
    };
  }

  // Delegate to Business Logic Service
  try {
    const rental = await createRentalBooking({
      clerkId,
      equipmentId: parsed.data.equipmentId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    });

    return {
      success: true,
      data: rental,
    };
  } catch (error: any) {
    // Map business logic errors to standardized ActionResponse
    const code = error.code || "INTERNAL_SERVER_ERROR";
    return {
      success: false,
      error: {
        code: code,
        message: error.message || "Ha ocurrido un error inesperado.",
      },
    };
  }
}
