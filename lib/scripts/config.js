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

const dataSetMap = {};

// let config = JSON.parse(
//   JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig)
// );

let config = GC.Spread.Sheets.Designer.DefaultConfig;

config.commandMap = {
  design: {
    commandName: "design",
    bigButton: "=AND(ribbonHeight>toolbarHeight,NOT(inDropdown))",
    direction: '=IF(ribbonHeight>toolbarHeight, "vertical", "horizontal")',
    dropdownMaxWidth: 165,
    iconClass: "ribbon-button-chart",
    text: "高级图表",
    title: "高级图表",
    execute: async function (context, propertyName, fontItalicChecked) {
      let tableData = getCurrentTableData(context.getWorkbook());
      let tableSchema = null;
      if (!dataSetMap[tableData.bindingPath]) {
        tableSchema = await createTableSchema(defaults, tableData.data);

        dataSetMap[tableData.bindingPath] = tableSchema;
        dataSetMap[tableData.bindingPath].dashboard = [];
        console.log(dataSetMap);
      } else {
        tableSchema = dataSetMap[tableData.bindingPath];
      }

      showChartDesigner(context.getWorkbook(), tableSchema, "dashboard");
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
      console.log("柱状图");
    },
  },
  edit: {
    commandName: "edit",
    bigButton: "=AND(ribbonHeight>toolbarHeight,NOT(inDropdown))",
    iconClass: "ribbon-button-formControl",
    text: "编辑图表",
    title: "编辑图表",
    execute: function (context, propertyName, fontItalicChecked) {
      console.log("编辑");
    },
  },
  updataData: {
    commandName: "updataData",
    bigButton: "=AND(ribbonHeight>toolbarHeight,NOT(inDropdown))",
    iconClass: "ribbon-button-formControl",
    text: "更新数据",
    title: "更新数据",
    execute: async function (context, propertyName, fontItalicChecked) {
      let tableData = getCurrentTableData(context.getWorkbook());
      let tableSchema = dataSetMap[tableData.bindingPath];
      await pushData(defaults, tableSchema, tableData.data);
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
      "updataData",
    ],
  },
});
