//import { client } from "@/utils/api.ts";

export const uploadFile = async (file: File) => {
  const API_URL = import.meta.env.VITE_API_URL;

  try {
    let imageUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        alert("File failed to upload");
        return "";
      }

      const data = await uploadRes.json();

      if ("error" in data) {
        console.error("Error in uploading file:", data.error);
        alert(`Failed to upload file: ${data.error}`);
        return "";
      }
      imageUrl = data.url as string;
    }
    return imageUrl;
  } catch (error) {
    console.error("Cannot upload file", error);
    return "";
  }
};
