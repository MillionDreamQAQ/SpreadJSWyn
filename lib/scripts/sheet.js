localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: "myApp",
  storeName: "cache",
  version: 1.0,
  size: 4980736,
});

const defaults = {
  portalUrl: "http://xa-cs-edensun:51980",
  token: "71577F8D5A4BD323829BD3A9360673E726E947878483AD85DF6B40D74C488CFA",
};
localforage.setItem("defaults", defaults);

let tableSchema, datasetSchema, chartDesigner;

let config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
  design: {
    commandName: "design",
    bigButton: "=AND(ribbonHeight>toolbarHeight,NOT(inDropdown))",
    direction: '=IF(ribbonHeight>toolbarHeight, "vertical", "horizontal")',
    dropdownMaxWidth: 165,
    iconClass: "ribbon-button-chart",
    text: "设计",
    title: "设计",
    execute: async function (context, propertyName, fontItalicChecked) {
      await dataPrepare(context, getCurrentTableData());
      chartDesigner = showChartDesigner(
        context.getWorkbook(),
        tableSchema,
        "dashboard"
      );
    },
  },
  chartDesignGallery: {
    bigButton: "=ribbonHeight>toolbarHeight",
    commandName: "chartDesignGallery",
    dropdownMaxWidth: 600,
    iconClass: "report-sheet-wizard",
    text: "图表设计",
    title: "图表设计",
  },
  chartDesignGroup1: {
    commandName: "chartDesignGroup1",
    title: "柱形图",
  },
  chartDesignBar: {
    bigButton: "=ribbonHeight>toolbarHeight",
    commandName: "chartDesignBar",
    iconClass: "ribbon-button-insert-column-preview",
    text: "柱状图",
    title: "柱状图",
    execute: function (context, propertyName, fontItalicChecked) {
      chartDesigner = showChartDesigner(
        context.getWorkbook(),
        tableSchema,
        "柱状图"
      );
    },
  },
  edit: {
    commandName: "edit",
    bigButton: "=AND(ribbonHeight>toolbarHeight,NOT(inDropdown))",
    iconClass: "ribbon-button-formControl",
    text: "编辑",
    title: "编辑",
    execute: function (context, propertyName, fontItalicChecked) {
      chartDesigner = showChartDesigner(context.getWorkbook(), tableSchema);
    },
  },
};

config.ribbon[1].buttonGroups.splice(2, 0, {
  label: "高级图表",
  thumbnailClass: "welcome",
  commandGroup: {
    children: [
      {
        command: "design",
        type: "dropdown",
        children: [
          {
            command: {
              title: "柱形图",
              commandName: "chartDesignGroup1",
            },
            type: "group",
            children: ["chartDesignBar"],
          },
        ],
      },
      "edit",
    ],
  },
});

let designer = new GC.Spread.Sheets.Designer.Designer(
  document.getElementById("gc-designer-container"),
  config
);

let spread = designer.getWorkbook();

let sheet = spread.getActiveSheet();

readFile(spread, "/template2.sjs", () => {
  spread
    .getActiveSheet()
    .setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(data));
});

async function createDataSet(defaults, columnsSchema) {
  let dataSchema = Object.entries(columnsSchema[0]);
  let resultArray = [];

  for (key in dataSchema) {
    let valueType = typeof dataSchema[key][1];
    resultArray.push([dataSchema[key][0], valueType]);
  }

  let tableSchema = {
    name: "table1",
    columns: resultArray.map((arr) => {
      return {
        name: arr[0],
        type: arr[1],
      };
    }),
  };

  tableSchema.dataset = await dataset(defaults, tableSchema.columns);

  let Schema = {};
  Schema[tableSchema.name] = tableSchema;
  return Schema;
}

async function dataset(defaults, columns) {
  let datasetName = "pushDataset" + Math.floor(Math.random() * 100000);
  columns.push({ name: datasetName, type: "Boolean" });
  let type = ["String", "Number", "Boolean", "Date", "DateTime"];
  let body = {
    name: datasetName,
    columns: columns.map((col, index) => {
      return {
        AddIndex: false,
        Name: col.name,
        Type: col.type.charAt(0).toUpperCase() + col.type.slice(1),
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
    //返回数据集id和名称
    return {
      status: 1,
      name: datasetName,
      id: result.id,
    };
  } else {
    //数据集创建异常
    return {
      status: 0,
      error_message: result.error_message,
    };
  }
}

async function ModifyPushDataset(defaults, tableSchema, data) {
  tableSchema.schema = getSchema(data[0]);
  tableSchema.data = data;
  let body = {
    name: tableSchema.dataset.datasetName,
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
    datasetId: "821c9484-9556-45ca-b332-226916d1fe6d",
    isTableStructureChanged: true,
  };
  let option = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  let result = await getRequest(
    defaults.portalUrl +
      "/api/pushdatasets/" +
      tableSchema.dataset.datasetId +
      "?token=" +
      defaults.token,
    option
  );
  if (result.success) {
    return tableSchema;
  } else {
    throw new Error("修改数据集失败");
  }
}

function pushData(defaults, tableSchema, data) {
  let id = tableSchema.dataset.datasetId;
  let columnsName = tableSchema.schema.map((col) => col.fieldName);
  let schemaStatus = 0;
  let pushData = data.map((obj) => {
    if (schemaStatus == 0)
      return columnsName.map((key, index) => {
        if (obj[key]) return obj[key];
        else {
          schemaStatus = 1;
          return null;
        }
      });
  });
  if (schemaStatus == 1) {
    tableSchema = ModifyPushDataset(defaults, tableSchema, data);
    return pushData(defaults, tableSchema, data);
  }
  let body = {
    columns: columnsName,
    rows: pushData,
    overwrite: false,
  };
  let option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  fetch(
    defaults.portalUrl +
      "/api/v2/data/datasets/push-datasets/" +
      id +
      "/append-data?token=" +
      defaults.token,
    option
  ).then((response) => {
    if (response.status != "204") throw Error("推送数据失败");
  });
  return tableSchema;
}

async function showChartDesigner(spread, tableSchema, visualType) {
  let designer = createDashboardDesigner(
    defaults,
    tableSchema,
    document.getElementById("designer"),
    visualType
  );
  let dialog = document.getElementById("chartDialog");
  dialog.style.display = "block";

  if (!dialog._initialized) {
    dialog.querySelector(".close-btn").onclick = async function () {
      dialog.style.display = "none";

      designer.destroy();

      let sheet = spread.getActiveSheet();

      let pictureId = await localforage.getItem("pictureId");
      let visualName = await localforage.getItem("visualName");

      if (pictureId) {
        let timestamp = new Date().getTime();
        let random = Math.floor(Math.random() * 100000).toString();
        let pictureName = "image_" + timestamp + "_" + random + ".png";
        let customFloatingObject =
          new GC.Spread.Sheets.FloatingObjects.FloatingObject(pictureName);
        customFloatingObject.startRow(1);
        customFloatingObject.startColumn(8);
        customFloatingObject.endColumn(18);
        customFloatingObject.endRow(26);

        let div = document.createElement("div");
        div.innerHTML = `<div id="chartDom${random}" style="width:100%;height:100%"></div>`;
        customFloatingObject.content(div);

        setTimeout(() => {
          createViewer(
            defaults,
            tableSchema.dashboard[0],
            document.getElementById(`chartDom${random}`)
          );
        }, 0);

        customFloatingObject.content(div);
        sheet.floatingObjects.add(customFloatingObject);
      }
    };
    dialog._initialized = true;
  }
  return designer;
}

async function dataPrepare(context, data) {
  // if (
  //   context.getData("treeNodeFromJson") ||
  //   context.getData("oldTreeNodeFromJson")
  // ) {
  tableSchema = await createTableSchema(defaults, data);
  datasetSchema = await createDataSet(defaults, data);

  pushData(defaults, tableSchema, data);
  // } else {
  //   console.log("没有绑定信息");
  // }
}

function getCurrentTableData() {
  let spread = designer.getWorkbook();
  let sheet = spread.getActiveSheet();
  let table = sheet.tables.find(
    sheet.getActiveRowIndex(),
    sheet.getActiveColumnIndex()
  );
  if (table) {
    let bindingPath = table.bindingPath();
    let data = sheet.getDataSource().getSource();

    return data[bindingPath];
  }
}
