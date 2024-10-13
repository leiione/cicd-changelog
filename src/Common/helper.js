export const preventEvent = e => {
  let ev = e || window.event
  if (ev.preventDefault) ev.preventDefault()
  else ev.returnValue = false
  if (ev.stopPropagation) ev.stopPropagation()
  return false
}


export const readFileAsBase64 = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.readAsDataURL(inputFile);

    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject("Problem parsing input file.");
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result.split(",").pop());
    };
  });
};

export const getExtensionFromFilename = filename => {
  try {
    return filename
      .split(".")
      .pop()
      .toLowerCase()
  } catch (e) {
    return ""
  }
}