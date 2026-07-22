import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Cargar variables de entorno
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Iniciando el seeding de la base de datos...");

  try {
    // Limpiar tablas para evitar duplicados si se corre varias veces
    console.log("🧹 Limpiando tablas de stock, productos y categorías...");
    await db.delete(schema.productStock);
    await db.delete(schema.products);
    await db.delete(schema.categories);

    console.log("📁 Insertando categorías...");
    const [cervezasCategory] = await db.insert(schema.categories).values({
      name: "Cervezas",
      slug: "cervezas",
      description: "Cervezas artesanales de la mejor calidad",
      metadata: { 
        attributesSchema: [
          { key: "abv", label: "ABV", type: "number", unit: "%", renderAsBadge: true },
          { key: "ibu", label: "IBU", type: "number", unit: " IBU", renderAsBadge: true },
          { key: "color", label: "Color", type: "string", unit: null, renderAsBadge: false }
        ]
      }
    }).returning();

    console.log("🍺 Insertando cervezas...");

    // Insertar productos (Cervezas)
    const insertedBeers = await db.insert(schema.products).values([
      {
        name: "Kölsch",
        description: "Cerveza rubia de origen alemán, ligera, refrescante y con un sutil frutado. Perfecta para cualquier ocasión.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 18, abv: 4.8, color: "Rubia pálida" }
      },
      {
        name: "Blonde Ale",
        description: "Clásica rubia americana. Suave, maltosa con un final limpio y muy poco amargor.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 15, abv: 4.5, color: "Dorado brillante" }
      },
      {
        name: "Irish Red Ale",
        description: "Cerveza rojiza con notas a caramelo y toffee. Amargor bajo y cuerpo medio, ideal para los amantes de la malta.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 22, abv: 5.2, color: "Rojo cobrizo" }
      },
      {
        name: "Porter",
        description: "Cerveza negra de estilo inglés. Notas a chocolate amargo y café tostado. Sedosa y robusta.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 25, abv: 5.5, color: "Negro opaco" }
      },
      {
        name: "Sweet Stout",
        description: "Cerveza negra cremosa y dulce. Su adición de lactosa le aporta un cuerpo denso y notas a chocolate con leche.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 20, abv: 5.0, color: "Negro intenso" }
      },
      {
        name: "English IPA",
        description: "La IPA original. Equilibrio perfecto entre el amargor terroso/herbal del lúpulo inglés y una base sólida de malta caramelo.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 45, abv: 6.0, color: "Ámbar" }
      },
      {
        name: "Honey Beer",
        description: "Cerveza rubia elaborada con miel pura. Un toque dulzón natural con un final seco que pide otro trago.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 12, abv: 6.5, color: "Dorado profundo" }
      },
      {
        name: "Session IPA",
        description: "IPA super ligera para tomar litros. Actualmente agotada, la estamos cocinando de nuevo.",
        categoryId: cervezasCategory.id,
        imageUrl: "/kolsch.png",
        attributes: { ibu: 35, abv: 4.0, color: "Dorado" }
      }
    ]).returning();

    console.log(`✅ ${insertedBeers.length} cervezas insertadas.`);
    console.log("📦 Insertando stock (latas de 473cm3 y recargas de 1000cm3)...");

    // Preparar el stock para cada cerveza insertada
    const stockToInsert = [];

    for (const beer of insertedBeers) {
      // Dejamos la Session IPA sin stock para verificar UI
      if (beer.name === "Session IPA") {
        continue; 
      }

      // Lata de 473cm3
      stockToInsert.push({
        productId: beer.id,
        sizeCm3: 473,
        quantity: Math.floor(Math.random() * 50) + 10, // Stock aleatorio entre 10 y 60
        price: "2500.00" // Precio ejemplo en ARS
      });

      // Recarga de botella 1L (1000cm3)
      stockToInsert.push({
        productId: beer.id,
        sizeCm3: 1000,
        quantity: Math.floor(Math.random() * 30) + 5, // Stock aleatorio entre 5 y 35
        price: "4500.00" // Precio ejemplo en ARS
      });
    }

    if (stockToInsert.length > 0) {
      await db.insert(schema.productStock).values(stockToInsert);
    }

    console.log(`✅ Stock inicial creado con éxito para ${stockToInsert.length} opciones.`);
    console.log("🎉 Seeding completado exitosamente.");

  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    process.exit(1);
  }
}

seed();
