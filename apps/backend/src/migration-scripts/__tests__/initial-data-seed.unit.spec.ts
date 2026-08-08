/**
 * Unit tests for the initial-data-seed migration script.
 *
 * The seed function requires a full Medusa container with workflows, so we
 * test the parts that matter for idempotency without booting Medusa:
 *
 * 1. The module exports a default function (the seed entry point).
 * 2. The fio-vivo collection creation is wrapped in try/catch so a duplicate
 *    collection does not crash the entire seed.
 *
 * The second suite mocks createCollectionsWorkflow to simulate a "duplicate"
 * error and asserts the seed function resolves without throwing.
 */

jest.mock("@medusajs/framework", () => ({
  MedusaContainer: class {},
}))

jest.mock("@medusajs/framework/utils", () => ({
  ContainerRegistrationKeys: {
    LOGGER: "logger",
    LINK: "link",
    QUERY: "query",
  },
  ModuleRegistrationName: {
    FULFILLMENT: "fulfillmentModuleService",
  },
  Modules: {
    STOCK_LOCATION: "stockLocation",
    FULFILLMENT: "fulfillment",
  },
  ProductStatus: {
    PUBLISHED: "published",
  },
}))

// Capture the workflow run calls so we can assert on them.
const workflowRunMocks = new Map<string, jest.Mock>()

function makeWorkflowMock(name: string) {
  const run = jest.fn().mockResolvedValue({ result: [{ id: `${name}_id` }] })
  workflowRunMocks.set(name, run)
  return jest.fn(() => ({ run }))
}

jest.mock("@medusajs/medusa/core-flows", () => ({
  createApiKeysWorkflow: makeWorkflowMock("apiKey"),
  createCollectionsWorkflow: makeWorkflowMock("collection"),
  createInventoryLevelsWorkflow: makeWorkflowMock("inventoryLevel"),
  createProductCategoriesWorkflow: makeWorkflowMock("productCategory"),
  createProductOptionsWorkflow: makeWorkflowMock("productOption"),
  createProductsWorkflow: makeWorkflowMock("product"),
  createRegionsWorkflow: makeWorkflowMock("region"),
  createSalesChannelsWorkflow: makeWorkflowMock("salesChannel"),
  createShippingOptionsWorkflow: makeWorkflowMock("shippingOption"),
  createShippingProfilesWorkflow: makeWorkflowMock("shippingProfile"),
  createStockLocationsWorkflow: makeWorkflowMock("stockLocation"),
  createStoresWorkflow: makeWorkflowMock("store"),
  createTaxRegionsWorkflow: makeWorkflowMock("taxRegion"),
  linkSalesChannelsToApiKeyWorkflow: makeWorkflowMock("linkApiKey"),
  linkSalesChannelsToStockLocationWorkflow: makeWorkflowMock(
    "linkStockLocation"
  ),
}))

describe("initial-data-seed module structure", () => {
  it("exports a default function", async () => {
    const seedModule = await import("../initial-data-seed.js")

    expect(seedModule.default).toBeDefined()
    expect(typeof seedModule.default).toBe("function")
  })

  it("the default function accepts an object with a container property", async () => {
    const seedModule = await import("../initial-data-seed.js")

    // The function signature is ({ container }: { container: MedusaContainer })
    expect(seedModule.default.length).toBeGreaterThanOrEqual(1)
  })
})

describe("initial-data-seed fio-vivo collection idempotency", () => {
  let seedFunction: (args: { container: unknown }) => Promise<void>

  function buildFakeContainer(): {
    resolve: jest.Mock
  } {
    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    }
    const link = {
      create: jest.fn().mockResolvedValue(undefined),
    }
    const query = {
      graph: jest.fn().mockResolvedValue({
        data: [{ id: "shipping_profile_1" }],
      }),
    }
    const fulfillmentModuleService = {
      createFulfillmentSets: jest.fn().mockResolvedValue({
        id: "fs_1",
        service_zones: [{ id: "sz_1" }],
      }),
    }

    // The seed calls query.graph twice: shipping_profile then inventory_item.
    // Return appropriate data for each.
    query.graph.mockImplementation((args: { entity: string }) => {
      if (args.entity === "shipping_profile") {
        return Promise.resolve({ data: [{ id: "sp_1" }] })
      }
      if (args.entity === "inventory_item") {
        return Promise.resolve({ data: [{ id: "inv_1" }, { id: "inv_2" }] })
      }
      return Promise.resolve({ data: [] })
    })

    const container = {
      resolve: jest.fn((key: string) => {
        if (key === "logger") return logger
        if (key === "link") return link
        if (key === "query") return query
        if (key === "fulfillmentModuleService") return fulfillmentModuleService
        return undefined
      }),
    }

    return container as unknown as { resolve: jest.Mock }
  }

  beforeEach(() => {
    jest.resetModules()
    // Clear all workflow mock call history.
    workflowRunMocks.forEach((fn) => fn.mockClear())
  })

  it("catches errors from createCollectionsWorkflow without throwing", async () => {
    // Make createCollectionsWorkflow reject to simulate a duplicate collection.
    const collectionRun = workflowRunMocks.get("collection")!
    collectionRun.mockRejectedValueOnce(new Error("Collection already exists"))

    seedFunction = (await import("../initial-data-seed.js")).default

    const container = buildFakeContainer()

    // The seed should NOT throw even though the collection workflow rejected.
    await expect(
      seedFunction({ container })
    ).resolves.not.toThrow()
  })

  it("logs an error when the collection workflow fails", async () => {
    const collectionRun = workflowRunMocks.get("collection")!
    collectionRun.mockRejectedValueOnce(new Error("Duplicate collection"))

    seedFunction = (await import("../initial-data-seed.js")).default

    const container = buildFakeContainer()
    await seedFunction({ container })

    const logger = container.resolve("logger")
    // The seed logs "Failed to seed fio-vivo collection:" on error.
    expect(logger.error).toHaveBeenCalled()
    const errorMsg = logger.error.mock.calls.find(
      (call: unknown[]) =>
        typeof call[0] === "string" &&
        call[0].includes("Failed to seed fio-vivo collection")
    )
    expect(errorMsg).toBeDefined()
  })

  it("proceeds past the collection block when it succeeds", async () => {
    // Reset collection mock to succeed.
    const collectionRun = workflowRunMocks.get("collection")!
    collectionRun.mockResolvedValueOnce({ result: [{ id: "col_fv" }] })

    seedFunction = (await import("../initial-data-seed.js")).default

    const container = buildFakeContainer()
    await seedFunction({ container })

    const logger = container.resolve("logger")
    // On success, the seed logs "Finished seeding fio-vivo collection."
    const infoMsg = logger.info.mock.calls.find(
      (call: unknown[]) =>
        typeof call[0] === "string" &&
        call[0].includes("Finished seeding fio-vivo collection")
    )
    expect(infoMsg).toBeDefined()
  })

  it("calls createCollectionsWorkflow for the fio-vivo collection", async () => {
    seedFunction = (await import("../initial-data-seed.js")).default

    const container = buildFakeContainer()
    await seedFunction({ container })

    const collectionRun = workflowRunMocks.get("collection")!
    // Find the call whose input includes handle: "fio-vivo"
    const fioVivoCall = collectionRun.mock.calls.find(
      (call: unknown[]) => {
        const input = (call[0] as { input?: { collections?: Array<{ handle?: string }> } })
          ?.input
        return input?.collections?.some((c) => c.handle === "fio-vivo")
      }
    )

    expect(fioVivoCall).toBeDefined()
  })

  it("includes all created product ids in the fio-vivo collection input", async () => {
    seedFunction = (await import("../initial-data-seed.js")).default

    const container = buildFakeContainer()
    await seedFunction({ container })

    const collectionRun = workflowRunMocks.get("collection")!
    const fioVivoCall = collectionRun.mock.calls.find(
      (call: unknown[]) => {
        const input = (call[0] as { input?: { collections?: Array<{ handle?: string }> } })
          ?.input
        return input?.collections?.some((c) => c.handle === "fio-vivo")
      }
    )

    const input = (fioVivoCall![0] as { input: { collections: Array<{ product_ids?: unknown[] }> } })
      .input
    expect(input.collections[0].product_ids).toBeDefined()
    expect(Array.isArray(input.collections[0].product_ids)).toBe(true)
  })
})