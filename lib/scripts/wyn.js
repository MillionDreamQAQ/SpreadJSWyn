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

async function deletePushDataSet(defaults, tableSchema) {
  let deleteOption = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
  let id = tableSchema.dataset.datasetId;

  await getRequest(
    defaults.portalUrl +
      "/api/pushdatasets/rebuild-table/" +
      id +
      "?token=" +
      defaults.token,
    deleteOption
  );
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
  await pushData(defaults, tableSchema, data);
  return tableSchema;
}

function createDashboardDesigner(
  defaults,
  tableSchema,
  designerDom,
  visualType
) {
  let datasetId = tableSchema.dataset.datasetId;
  let designer = WynBi.create("DashboardDesigner", {
    baseUrl: defaults.portalUrl,
    token: defaults.token,
  });
  designer.initialize({
    container: designerDom,
    defaults: {
      lng: "zh",
      theme: "default",
      documentThemeId: "e07dbf23-5def-4164-bb3a-5b82d6aab7bf",
      clickAction: "showTooltip",
      contextMenuActions: ["keep"],
      enableDeveloperMode: true,
      containerFilterScope: "",
      datasetId,
    },
    features: {
      toolbar: "hide",
      showInspector: true,
      showDataBindingPanel: true,
      componentCategories: null,
      componentCategories: [
        "charts",
        // 'visual'
      ],
      disableChangeDataset: true,
      disableAnimation: true,
      disableAutoScroll: false,
      showCloseButton: true,
    },
    onSave: async (docName, id) => {
      tableSchema.dashboard.push({
        dashboardName: docName,
        dashboardType: visualType,
        dashboardId: id,
        scenario: "",
      });
      designer.destroy();
    },
  });
  // designer.showInspector();
  return designer;
}

function createViewer(defaults, dashboard, dom) {
  let viewer = WynBi.create("DashboardViewer", {
    baseUrl: defaults.portalUrl,
    token: defaults.token,
  });
  if (dashboard.dashboardType == "dashboard") {
    viewer.initialize({
      container: dom,
      defaults: {
        dashboardId: dashboard.dashboardId,
        // "scenario": visualName,
      },
    });
  } else {
    viewer.initialize({
      container: visualSelector,
      defaults: {
        dashboardId: id,
        scenario: dashboard.scenario,
      },
    });
  }
  return viewer;
}

async function getVisual(defaults, id) {
  let document = await getRequest(
    defaults.portalUrl +
      "/api/dashboards/" +
      id +
      "/download?token=" +
      defaults.token
  );
  return document.scenarios[0].name;
}

function getViewer(result) {
  viewer = result.viewer;
  return viewer;
}
