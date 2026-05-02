export const getRequests = () => {
	if (typeof window === "undefined") return [];
	
  return JSON.parse(localStorage.getItem("requests")) || [];
};

export const addRequest = (req) => {
	if (typeof window === "undefined") return [];

  const current = getRequests();
	const newRequest = {
    ...req,
    status: "Pending",
  };
  const updated = [newRequest,...current];
  localStorage.setItem("requests", JSON.stringify(updated));
};

export const updateRequest = (index, data) => {
	if (typeof window === "undefined") return [];

  const current = getRequests();
  current[index] = { ...current[index], ...data };
  localStorage.setItem("requests", JSON.stringify(current));
};