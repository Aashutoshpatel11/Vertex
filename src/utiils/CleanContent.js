
export const cleanContent = (text) => {
  if (!text) return "";
  
  return text
    .replace(/""/g, "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\\/g, "") 
};