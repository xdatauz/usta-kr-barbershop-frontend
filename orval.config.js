module.exports = {
	petstore: {
		input: "./openapi.yaml",
		output: {
			mode: "split",
			target: "./src/shared/api/petstore",
			client: "react-query",
		},
	},
};
