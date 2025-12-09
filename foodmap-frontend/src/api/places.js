import api from "./api";

export const getPlaces = async () => {
  const response = await api.get("places/");
  return response.data;
};
