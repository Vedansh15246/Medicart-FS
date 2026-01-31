import catalogService from "../../api/catalogService";

export const fetchMedicines = async () => {
  const response = await catalogService.getMedicines();
  return response;
};
