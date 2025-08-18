import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Dendreo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dendreo',
		name: 'dendreo',
		icon: 'file:dendreo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Dendreo API',
		defaults: {
			name: 'Dendreo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dendreoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Entreprises',
						value: 'entreprises',
					},
					{
						name: 'Contacts',
						value: 'contacts',
					},
					{
						name: 'Actions de Formation',
						value: 'actions_de_formation',
					},
					{
						name: 'Sessions Permanentes',
						value: 'sessions_permanentes',
					},
				],
				default: 'entreprises',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all records',
						action: 'List all records',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by ID',
						action: 'Get a record by ID',
					},
				],
				default: 'list',
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				description: 'The ID of the record to get',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Include',
						name: 'include',
						type: 'string',
						default: '',
						description: 'Comma-separated list of related resources to include',
					},
					{
						displayName: 'Updated After',
						name: 'updated_after',
						type: 'dateTime',
						default: '',
						description: 'Only return records updated after this date',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 100,
						description: 'Maximum number of records to return',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						default: 1,
						description: 'Page number for pagination',
						typeOptions: {
							minValue: 1,
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i) as any;

				const credentials = await this.getCredentials('dendreoApi');
				const baseUrl = `https://pro.dendreo.com/${credentials.slug}/api`;

				// Map resource to endpoint
				const resourceEndpoints: { [key: string]: string } = {
					entreprises: 'entreprises.php',
					contacts: 'contacts.php',
					actions_de_formation: 'actions_de_formation.php',
					sessions_permanentes: 'sessions_permanentes.php',
				};

				const endpoint = resourceEndpoints[resource];
				if (!endpoint) {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
						{ itemIndex: i }
					);
				}

				let url = `${baseUrl}/${endpoint}`;
				const qs: any = {};

				// Handle operation-specific parameters
				if (operation === 'get') {
					const id = this.getNodeParameter('id', i) as string;
					if (!id) {
						throw new NodeOperationError(
							this.getNode(),
							'ID is required for get operation',
							{ itemIndex: i }
						);
					}
					qs.id = id;
				}

				// Add additional fields to query string
				Object.keys(additionalFields).forEach(key => {
					const value = additionalFields[key];
					if (value !== '' && value !== undefined && value !== null) {
						if (key === 'updated_after' && value) {
							// Convert date to ISO string if it's a date
							qs[key] = new Date(value).toISOString();
						} else {
							qs[key] = value;
						}
					}
				});

				const options = {
					method: 'GET' as const,
					url,
					qs,
					headers: {
						'Accept': 'application/json',
					},
					json: true,
				};

				try {
					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'dendreoApi',
						options,
					);

					// Ensure response is an array for consistent processing
					const responseData = Array.isArray(response) ? response : [response];

					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});

				} catch (error: any) {
					// Handle specific errors for get operation when not supported
					if (operation === 'get' && (error.statusCode === 404 || error.statusCode === 400)) {
						throw new NodeOperationError(
							this.getNode(),
							`Get operation by ID is not supported for ${resource}. Use the list operation with filters instead.`,
							{ itemIndex: i }
						);
					}

					throw new NodeOperationError(
						this.getNode(),
						`Dendreo ${resource}/${operation} failed: ${error.message}`,
						{ itemIndex: i }
					);
				}

			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({
						json: { error: errorMessage },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
