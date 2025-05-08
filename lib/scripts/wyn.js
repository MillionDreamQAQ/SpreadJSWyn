function createDashboardDesigner(
  defaults,
  tableSchema,
  designerSelector,
  visualSelector,
  onSuccess
) {
  let datasetId = tableSchema.dataset.id;
  let designer = WynBi.create("DashboardDesigner", {
    baseUrl: defaults.portalUrl,
    token: defaults.token,
  });
  designer.initialize({
    container: designerSelector,
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
      toolbar: "show",
      showInspector: true,
      showDataBindingPanel: true,
      componentCategories: null,
      componentCategories: ["charts", "visual"],
      disableChangeDataset: true,
      disableAnimation: true,
      disableAutoScroll: false,
      showCloseButton: true,
    },
    onSave: async (docName, id) => {
      console.log("save");

      visualName = await this.getVisual(defaults, id);
      let visual = {
        id,
        visualName,
      };
      designer.destroy();
      designerSelector.remove();
      let viewer = WynBi.create("DashboardViewer", {
        baseUrl: defaults.portalUrl,
        token: defaults.token,
      });
      viewer.initialize({
        container: visualSelector,
        defaults: {
          dashboardId: id,
          documentThemeId: "e07dbf23-5def-4164-bb3a-5b82d6aab7bf",
          scenario: visualName,
        },
      });
      localforage.setItem("pictureId", id);
      localforage.setItem("visualName", visualName);
      onSuccess({
        viewer: viewer,
      });
    },
  });
}

function getViewer(result) {
  viewer = result.viewer;
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

window.onload = async function () {
  console.log("wyn init");

  localforage.config({
    driver: [
      // 驱动优先级顺序
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE,
    ],
    name: "myApp", // 数据库名称
    storeName: "cache", // 存储仓库名
    version: 1.0, // 数据库版本
    size: 4980736, // 数据库大小（字节）
  });

  let defaults = await localforage.getItem("defaults");
  let schema = await localforage.getItem("table1Schema");

  createDashboardDesigner(
    defaults,
    schema,
    document.getElementById("designer"),
    document.getElementById("visual"),
    (viewer = getViewer)
  );
};
