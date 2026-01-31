import client from "./client";

// ============ CATALOG SERVICE ============
// Routes through API Gateway to Catalogue Service (port 8082)

export const catalogService = {
  // Get all medicines
  getMedicines: async (params = {}) => {
    const response = await client.get("/medicines", { params });
    return response.data;
  },

  // Get single medicine
  getMedicineById: async (id) => {
    const response = await client.get(`/medicines/${id}`);
    return response.data;
  },

  // Get all batches (for admin)
  getBatches: async (params = {}) => {
    const response = await client.get("/batches", { params });
    return response.data;
  },

  // Get single batch
  getBatchById: async (id) => {
    const response = await client.get(`/batches/${id}`);
    return response.data;
  },

  // Create medicine (admin only)
  createMedicine: async (medicineData) => {
    const response = await client.post("/medicines", medicineData);
    return response.data;
  },

  // Update medicine (admin only)
  updateMedicine: async (id, medicineData) => {
    const response = await client.put(`/medicines/${id}`, medicineData);
    return response.data;
  },

  // Delete medicine (admin only)
  deleteMedicine: async (id) => {
    const response = await client.delete(`/medicines/${id}`);
    return response.data;
  },

  // Create batch (admin only)
  createBatch: async (batchData) => {
    const response = await client.post("/batches", batchData);
    return response.data;
  },

  // Update batch (admin only)
  updateBatch: async (id, batchData) => {
    const response = await client.put(`/batches/${id}`, batchData);
    return response.data;
  },

  // Delete batch (admin only)
  deleteBatch: async (id) => {
    const response = await client.delete(`/batches/${id}`);
    return response.data;
  },
};

export default catalogService;
