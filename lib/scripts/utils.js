async function getRequest(url, request) {
  return await fetch(url, request).then((response) => response.json());
}

function readFile(spread, path, action) {
  fetch(path)
    .then((response) => response.blob())
    .then((blob) => {
      spread.open(
        blob,
        function () {
          action();
        },
        function (e) {
          console.log(e); // error callback
        },
        { openMode: GC.Spread.Sheets.OpenMode.normal, fullRecalc: true }
      );
    });
}

function getSchema(data) {
  let dataSchema = Object.entries(data);
  let resultArray = [];
  return dataSchema.map((entry) => {
    return {
      fieldName: entry[0],
      fieldType: determineType(String(entry[1])),
    };
  });
}

function determineType(str) {
  str.toString();
  if (str.toLowerCase() === "true" || str.toLowerCase() === "false") {
    return "Boolean";
  }

  if (!isNaN(str) && !isNaN(parseFloat(str))) {
    return "Number";
  }

  const date = new Date(str);
  if (date.toString() !== "Invalid Date") {
    if (str.includes(":")) {
      return "DateTime";
    } else {
      return "Date";
    }
  }

  return "String";
}
