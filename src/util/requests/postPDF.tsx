export const postPDF = async (file: File): Promise<any> => {
  // const url = "http://localhost:3002"; // Replace with your actual API endpoint
  const url = "https://pdf-processor-api.azurewebsites.net/"
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json(); // This presumes the API will return JSON
};