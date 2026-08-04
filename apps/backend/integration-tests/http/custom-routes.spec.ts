import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

medusaIntegrationTestRunner({
  testSuite: ({ api }) => {
    describe("Custom API Routes Integration Tests", () => {
      it("GET /admin/custom returns 200 OK", async () => {
        const response = await api.get("/admin/custom")
        expect(response.status).toEqual(200)
      })

      it("GET /store/custom returns 200 OK", async () => {
        const response = await api.get("/store/custom")
        expect(response.status).toEqual(200)
      })
    })
  },
})
