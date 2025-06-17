const axios = require("axios");
const fs = require("fs");
const request = require("request-promise");

async function authorize(
	id = process.env.FEISHU_ID,
	secret = process.env.FEISHU_SECRET
) {
	const options = {
		method: "POST",
		url: "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
		headers: {
			"Content-Type": "application/json",
		},
		data: {
			app_id: id,
			app_secret: secret,
		},
	};

	const response = await axios(options).catch((error) => console.error(error));

	if (response.status === 200) {
		return response.data.tenant_access_token;
	} else {
		console.error(response.data);
		return false;
	}
}

async function listRecords(
	app_token,
	table_id,
	parameters = null,
	id = process.env.FEISHU_ID,
	secret = process.env.FEISHU_SECRET
) {
	const tenantAccessToken = await authorize(id, secret);

	if (!tenantAccessToken) return false;

	const options = {
		method: "GET",
		url:
			"https://open.larksuite.com/open-apis/bitable/v1/apps/" +
			app_token +
			"/tables/" +
			table_id +
			"/records",
		headers: {
			Authorization: "Bearer " + tenantAccessToken,
			"Content-Type": "application/json",
		},
	};

	if (parameters) {
		options.params = parameters;
	}

	const response = await axios(options).catch((error) => console.error(error));

	if (response && response.data.code === 0) {
		return response.data.data;
	} else {
		return false;
	}
}

async function createRecord(
	app_token,
	table_id,
	body,
	parameters = null,
	id = process.env.FEISHU_ID,
	secret = process.env.FEISHU_SECRET
) {
	const tenantAccessToken = await authorize(id, secret);

	if (!tenantAccessToken) return false;

	const options = {
		method: "POST",
		url:
			"https://open.larksuite.com/open-apis/bitable/v1/apps/" +
			app_token +
			"/tables/" +
			table_id +
			"/records",
		headers: {
			Authorization: "Bearer " + tenantAccessToken,
			"Content-Type": "application/json",
		},
		data: body,
	};

	if (parameters) {
		options.params = parameters;
	}

	const response = await axios(options).catch((error) => console.error(error));

	if (response && response.data.code === 0) {
		return response.data.data;
	} else {
		return false;
	}
}

async function updateRecord(
	app_token,
	table_id,
	record_id,
	body,
	parameters = null,
	id = process.env.FEISHU_ID,
	secret = process.env.FEISHU_SECRET
) {
	const tenantAccessToken = await authorize(id, secret);

	if (!tenantAccessToken) return false;

	const options = {
		method: "PUT",
		url:
			"https://open.larksuite.com/open-apis/bitable/v1/apps/" +
			app_token +
			"/tables/" +
			table_id +
			"/records/" +
			record_id,
		headers: {
			Authorization: "Bearer " + tenantAccessToken,
			"Content-Type": "application/json",
		},
		data: body,
	};

	if (parameters) {
		options.params = parameters;
	}

	const response = await axios(options).catch((error) => console.error(error));

	if (response && response.data.code === 0) {
		return response.data.data;
	} else {
		return false;
	}
}

async function uploadFile(app_token, file_name, type) {
	const tenantAccessToken = await authorize();

	if (!tenantAccessToken) return false;

	const options = {
		method: "POST",
		url: "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all",
		headers: {
			Authorization: "Bearer " + tenantAccessToken,
			"Content-Type":
				"multipart/form-data; boundary=---011000010111000001101001",
		},
		formData: {
			file_name: file_name,
			parent_type: type,
			parent_node: app_token,
			size: fs.statSync(file_name).size,
			file: {
				value: fs.createReadStream(file_name),
				options: {
					filename: file_name,
					contentType: null,
				},
			},
		},
	};

	const response = await request(options).catch((error) =>
		console.error(error)
	);

	console.log(response);

	if (response && response.code === 0) {
		return response.data.file_token;
	} else {
		return false;
	}
}

module.exports = { listRecords, createRecord, updateRecord, uploadFile };
