import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
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
					{ name: 'Actions de Formation', value: 'actions_de_formation' },
					{ name: 'Administrateurs', value: 'administrateurs' },
					{ name: 'Catégories de Module', value: 'categories_module' },
					{ name: 'Centres de Formation', value: 'centres_de_formation' },
					{ name: 'Checklists', value: 'checklists' },
					{ name: 'Checks', value: 'checks' },
					{ name: 'Contacts', value: 'contacts' },
					{ name: 'Créneaux', value: 'creneaux' },
					{ name: 'Entreprises', value: 'entreprises' },
					{ name: 'Étapes', value: 'etapes' },
					{ name: 'Évaluations', value: 'evaluations' },
					{ name: 'Exports', value: 'exports' },
					{ name: 'Factures', value: 'factures' },
					{ name: 'Fichiers', value: 'fichiers' },
					{ name: 'Financements', value: 'financements' },
					{ name: 'Financeurs', value: 'financeurs' },
					{ name: 'Formateurs', value: 'formateurs' },
					{ name: 'Inscriptions', value: 'inscriptions' },
					{ name: 'Modules/Produits', value: 'modules' },
					{ name: 'Opportunités', value: 'opportunites' },
					{ name: 'Participants', value: 'participants' },
					{ name: 'Particuliers', value: 'particuliers' },
					{ name: 'Règlements', value: 'reglements' },
					{ name: 'Salles de Formation', value: 'salles_de_formation' },
					{ name: 'Sessions Permanentes', value: 'sessions_permanentes' },
					{ name: 'Sources', value: 'sources' },
					{ name: 'Souhaits', value: 'souhaits' },
					{ name: 'Tâches', value: 'taches' },
					{ name: 'Types de Produit', value: 'types_produit' },
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
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record',
						action: 'Create a new record',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing record',
						action: 'Update an existing record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
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
						operation: ['get', 'update', 'delete'],
					},
				},
				description: 'The ID of the record',
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'JSON data for the record',
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
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search term for filtering results',
					},
					{
						displayName: 'Filter',
						name: 'filter',
						type: 'json',
						default: '{}',
						description: 'Additional filters as JSON object',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Resource endpoint mapping based on Dendreo API documentation
		const resourceEndpoints: { [key: string]: string } = {
			actions_de_formation: 'actions_de_formation.php',
			administrateurs: 'administrateurs.php',
			categories_module: 'categories_module.php',
			centres_de_formation: 'centres_de_formation.php',
			checklists: 'checklists.php',
			checks: 'checks.php',
			contacts: 'contacts.php',
			creneaux: 'creneaux.php',
			entreprises: 'entreprises.php',
			etapes: 'etapes.php',
			evaluations: 'evaluations.php',
			exports: 'exports.php',
			factures: 'factures.php',
			fichiers: 'fichiers.php',
			financements: 'financements.php',
			financeurs: 'financeurs.php',
			formateurs: 'formateurs.php',
			inscriptions: 'inscriptions.php',
			modules: 'modules.php',
			opportunites: 'opportunites.php',
			participants: 'participants.php',
			particuliers: 'particuliers.php',
			reglements: 'reglements.php',
			salles_de_formation: 'salles_de_formation.php',
			sessions_permanentes: 'sessions_permanentes.php',
			sources: 'sources.php',
			souhaits: 'souhaits.php',
			taches: 'taches.php',
			types_produit: 'types_produit.php',
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

				const credentials = await this.getCredentials('dendreoApi');
				const baseUrl = `https://pro.dendreo.com/${credentials.slug}/api`;

				const endpoint = resourceEndpoints[resource];
				if (!endpoint) {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
						{ itemIndex: i }
					);
				}

				let url = `${baseUrl}/${endpoint}`;
				const qs: IDataObject = {};
				let method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
				let body: IDataObject | undefined;

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
					method = 'GET';
				} else if (operation === 'create') {
					const data = this.getNodeParameter('data', i) as string;
					try {
						body = JSON.parse(data);
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid JSON data provided',
							{ itemIndex: i }
						);
					}
					method = 'POST';
				} else if (operation === 'update') {
					const id = this.getNodeParameter('id', i) as string;
					const data = this.getNodeParameter('data', i) as string;
					if (!id) {
						throw new NodeOperationError(
							this.getNode(),
							'ID is required for update operation',
							{ itemIndex: i }
						);
					}
					try {
						body = JSON.parse(data);
						(body as IDataObject).id = id;
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							'Invalid JSON data provided',
							{ itemIndex: i }
						);
					}
					method = 'POST'; // Dendreo uses POST for updates
				} else if (operation === 'delete') {
					const id = this.getNodeParameter('id', i) as string;
					if (!id) {
						throw new NodeOperationError(
							this.getNode(),
							'ID is required for delete operation',
							{ itemIndex: i }
						);
					}
					qs.id = id;
					method = 'DELETE';
				}

				// Add additional fields to query string for GET operations
				if (method === 'GET') {
					Object.keys(additionalFields).forEach(key => {
						const value = additionalFields[key];
						if (value !== '' && value !== undefined && value !== null) {
							if (key === 'updated_after' && value) {
								// Convert date to ISO string if it's a date
								qs[key] = new Date(value as string).toISOString();
							} else if (key === 'filter' && value) {
								// Parse filter JSON and add to query string
								try {
									const filterObj = JSON.parse(value as string);
									Object.assign(qs, filterObj);
								} catch (error) {
									// If filter is not valid JSON, treat as string
									qs[key] = value;
								}
							} else {
								qs[key] = value;
							}
						}
					});
				}

				const options: IDataObject = {
					method,
					url,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					json: true,
				};

				if (Object.keys(qs).length > 0) {
					options.qs = qs;
				}

				if (body && method === 'POST') {
					options.body = body;
				}

				try {
					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'dendreoApi',
						options,
					);

					// Handle different response types
					let responseData;
					if (Array.isArray(response)) {
						responseData = response;
					} else if (typeof response === 'object' && response !== null) {
						responseData = [response];
					} else {
						responseData = [{ result: response }];
					}

					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});

				} catch (error: any) {
					// Provide helpful error messages based on the operation
					let errorMessage = `Dendreo ${resource}/${operation} failed: ${error.message}`;
					
					if (error.statusCode === 401) {
						errorMessage = `Authentication failed. Please check your API key and permissions for ${resource}.`;
					} else if (error.statusCode === 404) {
						if (operation === 'get') {
							errorMessage = `${resource} with ID ${qs.id} not found.`;
						} else {
							errorMessage = `${resource} endpoint not found. This resource may not support ${operation} operations.`;
						}
					} else if (error.statusCode === 403) {
						errorMessage = `Permission denied. Please enable read/write permissions for ${resource} in your Dendreo account.`;
					} else if (error.statusCode === 422) {
						errorMessage = `Validation error: ${error.message}. Please check your data format.`;
					}

					throw new NodeOperationError(
						this.getNode(),
						errorMessage,
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