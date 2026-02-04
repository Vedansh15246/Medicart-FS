import catalogService from "../../api/catalogService";

export const fetchBatches = async () => {
  const res = await catalogService.getBatches();
  return res;
};

export const fetchMedicines = async () => {
  const res = await catalogService.getMedicines();
  return res;
};

export const createBatch = async (data) => {
  const res = await catalogService.createBatch(data);
  return res;
};

export const updateBatch = async ({ id, data }) => {
  const res = await catalogService.updateBatch(id, data);
  return res;
};

export const deleteBatch = async (id) => {
  await catalogService.deleteBatch(id);
};
