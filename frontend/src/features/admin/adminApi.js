import catalogService from "../../api/catalogService";

export const fetchAdminMedicines = async () => {
  const res = await catalogService.getMedicines();
  return res;
};

export const createMedicine = async (data) => {
  const res = await catalogService.createMedicine(data);
  return res;
};

export const updateMedicine = async ({ id, data }) => {
  const res = await catalogService.updateMedicine(id, data);
  return res;
};

export const deleteMedicine = async (id) => {
  await catalogService.deleteMedicine(id);
};
