var schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  properties: {
    table1: {
      dataFieldType: "table",
      type: "array",
      items: {
        type: "object",
        properties: {
          姓名: {
            type: "string",
          },
          性别: {
            type: "string",
          },
          年龄: {
            type: "string",
          },
          身高: {
            type: "string",
          },
          体重: {
            type: "string",
          },
        },
      },
    },
  },
  type: "object",
};

var data = [
  { 姓名: "1/6/2013", 性别: "Pencil", 年龄: 95, 身高: 1.99 },
  { 姓名: "4/1/2013", 性别: "Binder", 年龄: 60, 身高: 4.99 },
  { 姓名: "6/8/2013", 性别: "Pen Set", 年龄: 16, 身高: 15.99 },
];

var data1 = [
  { 姓名: "1/6/2013", 性别: "man", 年龄: 10, 身高: 18 },
  { 姓名: "4/1/2013", 性别: "man", 年龄: 20, 身高: 19 },
  { 姓名: "6/8/2013", 性别: "man", 年龄: 30, 身高: 20 },
];
export { schema, data };
