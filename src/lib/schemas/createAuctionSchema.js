const schema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
      },
      required: ["title"],
    },
  },
  required: ["body"],
};

export default schema;
