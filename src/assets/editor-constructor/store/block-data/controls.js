const { apiFetch } = wp;

export function API_FETCH({ request }) {
  return apiFetch(request).then((fetchedData) => {
    if (fetchedData && fetchedData.success && fetchedData.response) {
      return fetchedData.response;
    }
    return false;
  });
}
