import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const allCountries = ["br", ...countries];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa for Fio Vivo",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Fio Vivo Store",
          supported_currencies: [
            {
              currency_code: "brl",
              is_default: true,
            },
            {
              currency_code: "eur",
              is_default: false,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });

  let regionResult = (existingRegions || []) as Array<{ id: string; name: string; currency_code: string }>;
  let brazilRegion = regionResult.find((r) => r.currency_code === "brl");
  let europeRegion = regionResult.find((r) => r.currency_code === "eur");

  if (!brazilRegion) {
    try {
      const { result: created } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Brasil",
              currency_code: "brl",
              countries: ["br"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      brazilRegion = created[0];
      regionResult.push(brazilRegion);
    } catch (err) {
      logger.warn(`Region Brasil creation skipped or failed: ${err}`);
    }
  }

  if (!europeRegion) {
    try {
      const { result: created } = await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Europe",
              currency_code: "eur",
              countries,
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      europeRegion = created[0];
      regionResult.push(europeRegion);
    } catch (err) {
      logger.warn(`Region Europe creation skipped or failed: ${err}`);
    }
  }

  const region = brazilRegion || europeRegion || regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });
  const existingTaxCodes = new Set((existingTaxRegions || []).map((t: any) => t.country_code));
  const missingTaxCodes = allCountries.filter((c) => !existingTaxCodes.has(c));

  if (missingTaxCodes.length > 0) {
    try {
      await createTaxRegionsWorkflow(container).run({
        input: missingTaxCodes.map((country_code) => ({
          country_code,
          provider_id: "tp_system",
        })),
      });
    } catch (err) {
      logger.warn(`Tax region creation skipped: ${err}`);
    }
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { data: existingStockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });

  let stockLocation = existingStockLocations?.[0];
  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Atelier Fio Vivo São Paulo",
            address: {
              city: "São Paulo",
              country_code: "BR",
              address_1: "Rua Harmonia, Vila Madalena",
            },
          },
          {
            name: "European Warehouse",
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_provider_id: "manual_manual",
        },
      });
    } catch {}
  }

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  let fulfillmentSet: any;
  try {
    const { data: existingFulfillmentSets } = await query.graph({
      entity: "fulfillment_set",
      fields: ["id", "name"],
    });
    fulfillmentSet = existingFulfillmentSets?.find((f: any) => f.name === "European Warehouse delivery");
    if (!fulfillmentSet) {
      fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
        name: "European Warehouse delivery",
        type: "shipping",
        service_zones: [
          {
            name: "Europe",
            geo_zones: [
              { country_code: "gb", type: "country" },
              { country_code: "de", type: "country" },
              { country_code: "dk", type: "country" },
              { country_code: "se", type: "country" },
              { country_code: "fr", type: "country" },
              { country_code: "es", type: "country" },
              { country_code: "it", type: "country" },
            ],
          },
        ],
      });

      if (stockLocation) {
        await link.create({
          [Modules.STOCK_LOCATION]: {
            stock_location_id: stockLocation.id,
          },
          [Modules.FULFILLMENT]: {
            fulfillment_set_id: fulfillmentSet.id,
          },
        });
      }
    }
  } catch (err) {
    logger.warn(`Fulfillment set creation skipped: ${err}`);
  }

  if (fulfillmentSet?.service_zones?.[0]?.id) {
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Envio Padrão Brasil",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Padrão",
              description: "Entrega em 3 a 5 dias úteis.",
              code: "standard_br",
            },
            prices: [
              {
                currency_code: "brl",
                amount: 25,
              },
              {
                currency_code: "usd",
                amount: 10,
              },
              {
                currency_code: "eur",
                amount: 10,
              },
              {
                region_id: region.id,
                amount: 25,
              },
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
          {
            name: "Envio Expresso Brasil",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: "Expresso",
              description: "Entrega em 24 a 48 horas.",
              code: "express_br",
            },
            prices: [
              {
                currency_code: "brl",
                amount: 45,
              },
              {
                currency_code: "usd",
                amount: 15,
              },
              {
                currency_code: "eur",
                amount: 15,
              },
              {
                region_id: region.id,
                amount: 45,
              },
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
        ],
      });
    } catch (err) {
      logger.warn(`Shipping options creation skipped: ${err}`);
    }
  }
  logger.info("Finished seeding fulfillment data.");

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    });
  } catch (err) {
    logger.warn(`Link sales channels to stock location skipped: ${err}`);
  }
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Tapeçarias",
          is_active: true,
        },
        {
          name: "Esculturas Têxteis",
          is_active: true,
        },
        {
          name: "Arte Botânica",
          is_active: true,
        },
        {
          name: "Edições Especiais",
          is_active: true,
        },
      ],
    },
  });

  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container
  ).run({
    input: {
      product_options: [
        {
          title: "Edição",
          values: ["Peça Única", "Tiragem Limitada"],
        },
      ],
    },
  });
  const editionOption = productOptionsResult[0];
  const primaryCategory = categoryResult[0];

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Espiral Dourada",
          category_ids: [primaryCategory.id],
          description:
            "Tapeçaria contemporânea tecida manualmente com fios de algodão puro e pigmentos naturais dourados.",
          handle: "espiral-dourada",
          weight: 650,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Tapeçaria e Arte Têxtil Contemporânea",
              artist: "Artesã Fio Vivo",
              material: "100% Algodão Cru e Pigmentos Botânicos",
              year: 2026,
              story: "Inspirada nos movimentos orgânicos da natureza e nas espirais ancestrais.",
              ambientColors: ["#f5efe6", "#d9c3b0", "#8c6d53"],
              displayOrder: 1,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-001-espiral-dourada/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-001-espiral-dourada/02-perfil.png",
            },
            {
              url: "/images/fio-vivo/fv-001-espiral-dourada/03-gesto.png",
            },
            {
              url: "/images/fio-vivo/fv-001-espiral-dourada/04-detalhe.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-001-ESPIRAL",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 380,
                  currency_code: "brl",
                },
                {
                  amount: 68,
                  currency_code: "eur",
                },
                {
                  amount: 75,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Órbita Negra",
          category_ids: [primaryCategory.id],
          description:
            "Peça têxtil de forte presença visual, combinando fios escuros profundos e texturas táteis marcantes.",
          handle: "orbita-negra",
          weight: 720,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Escultura Têxtil de Parede",
              artist: "Artesã Fio Vivo",
              material: "Fios Nobres e Tingimento Natural Negro",
              year: 2026,
              story: "Exploração de sombras, relevos e contrastes na tapeçaria moderna.",
              ambientColors: ["#1a1a1a", "#333333", "#e0d7ce"],
              displayOrder: 2,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-002-orbita-negra/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-002-orbita-negra/02-perfil.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-002-ORBITA",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 420,
                  currency_code: "brl",
                },
                {
                  amount: 75,
                  currency_code: "eur",
                },
                {
                  amount: 82,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Trama Solar",
          category_ids: [primaryCategory.id],
          description:
            "Composição circular radiante que celebra a luz solar e a energia das fibras naturais.",
          handle: "trama-solar",
          weight: 580,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Mandala e Tapeçaria Solar",
              artist: "Artesã Fio Vivo",
              material: "Fibras Naturais e Urucum",
              year: 2026,
              story: "A celebração do sol nascente através de nós e texturas vibrantes.",
              ambientColors: ["#fef8ea", "#e8bb6b", "#9c572a"],
              displayOrder: 3,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-003-trama-solar/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-003-trama-solar/02-perfil.png",
            },
            {
              url: "/images/fio-vivo/fv-003-trama-solar/03-gesto.png",
            },
            {
              url: "/images/fio-vivo/fv-003-trama-solar/04-detalhe.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-003-TRAMA",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 350,
                  currency_code: "brl",
                },
                {
                  amount: 62,
                  currency_code: "eur",
                },
                {
                  amount: 68,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Fio Ancestral",
          category_ids: [primaryCategory.id],
          description:
            "Bolsa tote de formato marcante tecida em nó ancestral com algodão orgânico e pigmentos minerais.",
          handle: "fio-ancestral",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Tapeçaria Botânica e Nó Ancestral",
              artist: "Artesã Fio Vivo",
              material: "Algodão Orgânico e Pigmentos Minerais",
              year: 2026,
              story: "Conexão profunda com a ancestralidade e os tons terrosos da mata.",
              ambientColors: ["#eef2ea", "#7c8d6d", "#3a4a32"],
              displayOrder: 4,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-004-fio-ancestral/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-004-fio-ancestral/02-perfil.png",
            },
            {
              url: "/images/fio-vivo/fv-004-fio-ancestral/03-gesto.png",
            },
            {
              url: "/images/fio-vivo/fv-004-fio-ancestral/04-detalhe.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-004-ANCESTRAL",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 450,
                  currency_code: "brl",
                },
                {
                  amount: 80,
                  currency_code: "eur",
                },
                {
                  amount: 88,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Trança Âmbar",
          category_ids: [primaryCategory.id],
          description:
            "Bolsa de mão delicada estilo clutch drapeada com tranças manuais fluidas em fio torcido.",
          handle: "tranca-ambar",
          weight: 520,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Clutch Drapeada Trançada",
              artist: "Artesã Fio Vivo",
              material: "Fio de Algodão e Fecho em Metal Bronze",
              year: 2026,
              story: "Tranças fluidas e elegantes em tons de âmbar natural.",
              ambientColors: ["#edf4f7", "#6b8ea8", "#244257"],
              displayOrder: 5,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-005-tranca-ambar/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-005-tranca-ambar/02-perfil.png",
            },
            {
              url: "/images/fio-vivo/fv-005-tranca-ambar/03-gesto.png",
            },
            {
              url: "/images/fio-vivo/fv-005-tranca-ambar/04-detalhe.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-005-TRANCA",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 320,
                  currency_code: "brl",
                },
                {
                  amount: 58,
                  currency_code: "eur",
                },
                {
                  amount: 64,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
        {
          title: "Duna Terracota",
          category_ids: [primaryCategory.id],
          description:
            "Bolsa ampla e sofisticada com relevos orgânicos inspirados no movimento das dunas e tingimento terracota.",
          handle: "duna-terracota",
          weight: 950,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: {
            gallery: {
              contextualName: "Bolsa Grande de Ombro Terracota",
              artist: "Artesã Fio Vivo",
              material: "Fios Mistos Naturais e Pigmento Terracota",
              year: 2026,
              story: "Relevos orgânicos evocando o movimento e aconchego das dunas.",
              ambientColors: ["#f2efe9", "#9b8d78", "#4e3d2c"],
              displayOrder: 6,
              featured: true,
            },
          },
          images: [
            {
              url: "/images/fio-vivo/fv-006-duna-terracota/01-frente.png",
            },
            {
              url: "/images/fio-vivo/fv-006-duna-terracota/02-perfil.png",
            },
            {
              url: "/images/fio-vivo/fv-006-duna-terracota/03-gesto.png",
            },
            {
              url: "/images/fio-vivo/fv-006-duna-terracota/04-detalhe.png",
            },
          ],
          options: [{ id: editionOption.id }],
          variants: [
            {
              title: "Peça Única / 2026",
              sku: "FV-006-DUNA",
              options: {
                Edição: "Peça Única",
              },
              prices: [
                {
                  amount: 480,
                  currency_code: "brl",
                },
                {
                  amount: 85,
                  currency_code: "eur",
                },
                {
                  amount: 95,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding fio-vivo collection...");
  try {
    await createCollectionsWorkflow(container).run({
      input: {
        collections: [
          {
            title: "Coleção Fio Vivo",
            handle: "fio-vivo",
            product_ids: createdProducts.map((product) => product.id),
          },
        ],
      },
    });
    logger.info("Finished seeding fio-vivo collection.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(
      `Could not seed fio-vivo collection (it may already exist): ${message}`
    );
  }

  logger.info("Seeding inventory levels.");

  try {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    });

    if (inventoryItems && inventoryItems.length > 0 && stockLocation?.id) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map((item) => ({
            location_id: stockLocation.id,
            stocked_quantity: 1000000,
            inventory_item_id: item.id,
          })),
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Could not seed inventory levels (they may already exist): ${message}`);
  }

  logger.info("Finished seeding inventory levels data.");
}
