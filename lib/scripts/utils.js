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

async function getRequest(url, request) {
  return await fetch(url, request).then((response) => response.json());
}

async function createPushDataset(defaults, schema) {
  let datasetName = "pushDataset" + Math.floor(Math.random() * 100000);
  let body = {
    name: datasetName,
    columns: schema.map((col, index) => {
      return {
        AddIndex: false,
        Name: col.fieldName,
        Type: col.fieldType,
        DataVizAIHint: 0,
        FieldDescription: "",
        DbColumnName: "column_" + (index + 1),
      };
    }),
    comment: "",
    tagIds: [],
    pushDataToken: "",
    securityFilter: {
      leftType: 0,
      leftValue: "",
      dataType: "",
      operator: "",
      rightType: 3,
      rightValue: "",
      rightValue2: "",
      type: 0,
      items: [],
    },
  };
  let option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  let result = await getRequest(
    defaults.portalUrl + "/api/pushdatasets?token=" + defaults.token,
    option
  );
  if (result.success) {
    const dataset = {
      datasetId: result.id,
      datasetName: datasetName,
    };
    return dataset;
  } else {
    throw new Error("创建数据集失败");
  }
}

async function createTableSchema(defaults, data) {
  let tableSchema = {
    dataset: {
      datasetId: "",
      datasetName: "",
    },
    tableId: "",
    dashboard: [],
    schema: getSchema(data[0]),
    data: data,
  };
  tableSchema.dataset = await createPushDataset(defaults, tableSchema.schema);
  pushData(defaults, tableSchema, data);
  return tableSchema;
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
