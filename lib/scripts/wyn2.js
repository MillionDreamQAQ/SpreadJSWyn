function createDashboardDesigner(
  defaults,
  tableSchema,
  designerDom,
  visualType
) {
  let datasetId = tableSchema.dataset.datasetId;
  var designer = WynBi.create("DashboardDesigner", {
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
      // toolbar: 'hide',
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

async function deletePushDataSet(defaults, tableSchema) {
  var raw = JSON.stringify({
    columnName: tableSchema.dataset.name,
    option: "=",
    value: null,
  });
  let deleteOption = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: raw,
  };
  let id = tableSchema.dataset.id;

  getRequest(
    defaults.portalUrl +
      "/api/pushdatasets/" +
      id +
      "/data?token=" +
      defaults.token,
    deleteOption
  );
}

function getViewer(result) {
  viewer = result.viewer;
  return viewer;
}
