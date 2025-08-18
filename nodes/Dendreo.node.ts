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
		icon: 'file:dendreo-new.svg',
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
					{ name: 'Checklists (⚠️ Requires cible)', value: 'checklists' },
					{ name: 'Contacts', value: 'contacts' },
					{ name: 'Créneaux', value: 'creneaux' },
					{ name: 'Entreprises', value: 'entreprises' },
					{ name: 'Étapes', value: 'etapes' },
					{ name: 'Évaluations', value: 'evaluations' },
					{ name: 'Exports (⚠️ Requires nom_export)', value: 'exports' },
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
						displayName: 'Max Total Records',
						name: 'maxTotalRecords',
						type: 'number',
						default: 1000,
						description: 'Maximum total number of records to fetch across all pages (prevents infinite loops)',
						typeOptions: {
							minValue: 1,
							maxValue: 10000,
						},
					},
					{
						displayName: 'Auto Paginate',
						name: 'autoPaginate',
						type: 'boolean',
						default: false,
						description: 'Automatically fetch all pages until limit is reached',
					},
					{
						displayName: 'Request Delay (ms)',
						name: 'requestDelay',
						type: 'number',
						default: 0,
						description: 'Delay between API requests in milliseconds (for rate limiting)',
						typeOptions: {
							minValue: 0,
							maxValue: 5000,
						},
					},
					{
						displayName: 'Retry Attempts',
						name: 'retryAttempts',
						type: 'number',
						default: 0,
						description: 'Number of retry attempts for failed requests',
						typeOptions: {
							minValue: 0,
							maxValue: 5,
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
					{
						displayName: 'Cible (for Checklists)',
						name: 'cible',
						type: 'string',
						default: '',
						description: 'Required for Checklists resource - specify the target type',
					},
					{
						displayName: 'Nom Export (for Exports)',
						name: 'nom_export',
						type: 'string',
						default: '',
						description: 'Required for Exports resource - specify the export name slug',
					},
					{
						displayName: 'Date Début (for Exports)',
						name: 'date_debut',
						type: 'dateTime',
						default: '',
						description: 'Start date for exports (YYYY-MM-DD format)',
					},
					{
						displayName: 'Date Fin (for Exports)',
						name: 'date_fin',
						type: 'dateTime',
						default: '',
						description: 'End date for exports (YYYY-MM-DD format)',
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
		};

		// Resources with special requirements
		const specialRequirements: { [key: string]: string[] } = {
			checklists: ['cible'], // Requires 'cible' parameter
			exports: ['nom_export'], // Requires 'nom_export' parameter
		};

		// Resources that don't support GET operations for listing
		const noGetSupport = ['checks'];

		// Resources that don't exist or aren't available
		const unavailableResources = ['types_produit'];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

				const credentials = await this.getCredentials('dendreoApi');
				const baseUrl = `https://pro.dendreo.com/${credentials.slug}/api`;

				// Check if resource is unavailable
				if (unavailableResources.includes(resource)) {
					throw new NodeOperationError(
						this.getNode(),
						`Resource "${resource}" is not available in this Dendreo instance`,
						{ itemIndex: i }
					);
				}

				// Check if resource doesn't support GET operations
				if (noGetSupport.includes(resource) && (operation === 'list' || operation === 'get')) {
					throw new NodeOperationError(
						this.getNode(),
						`Resource "${resource}" does not support ${operation} operations`,
						{ itemIndex: i }
					);
				}

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

				// Check for special requirements
				if (specialRequirements[resource] && method === 'GET') {
					const requiredParams = specialRequirements[resource];
					for (const param of requiredParams) {
						if (!additionalFields[param]) {
							throw new NodeOperationError(
								this.getNode(),
								`Resource "${resource}" requires the parameter "${param}" in Additional Fields`,
								{ itemIndex: i }
							);
						}
					}
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

				// Add request delay if specified
				const requestDelay = additionalFields.requestDelay as number || 0;
				if (requestDelay > 0 && i > 0) {
					await new Promise(resolve => setTimeout(resolve, requestDelay));
				}

				// Retry logic
				const maxRetries = additionalFields.retryAttempts as number || 0;
				let lastError;
				
				for (let attempt = 0; attempt <= maxRetries; attempt++) {
					try {
						if (attempt > 0) {
							// Wait before retry (exponential backoff)
							const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
							await new Promise(resolve => setTimeout(resolve, retryDelay));
						}
						
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

					// Apply client-side limit if specified (since Dendreo API doesn't respect limit parameter)
					if (operation === 'list' && additionalFields.limit) {
						const limit = additionalFields.limit as number;
						if (limit && responseData.length > limit) {
							responseData = responseData.slice(0, limit);
						}
					}

					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
					
					// If we reach here, the request was successful, break out of retry loop
					break;

				} catch (error: any) {
					lastError = error;
					
					// Check if this is a retryable error
					const isRetryable = error.statusCode >= 500 || error.statusCode === 429 || error.code === 'ECONNRESET';
					
					if (attempt === maxRetries || !isRetryable) {
						// This is the last attempt or error is not retryable, throw the error
						break;
					}
					// Otherwise, continue to next retry attempt
				}
			}
			
			// If we exit the retry loop with an error, handle it
			if (lastError) {
					// Provide helpful error messages based on the operation
					let errorMessage = `Dendreo ${resource}/${operation} failed: ${lastError.message}`;
					
					if (lastError.statusCode === 401) {
						errorMessage = `Authentication failed. Please check your API key and permissions for ${resource}.`;
					} else if (lastError.statusCode === 404) {
						if (operation === 'get') {
							errorMessage = `${resource} with ID ${qs.id} not found.`;
						} else {
							errorMessage = `${resource} endpoint not found. This resource may not support ${operation} operations.`;
						}
					} else if (lastError.statusCode === 403) {
						errorMessage = `Permission denied. Please enable read/write permissions for ${resource} in your Dendreo account.`;
					} else if (lastError.statusCode === 422) {
						errorMessage = `Validation error: ${lastError.message}. Please check your data format.`;
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