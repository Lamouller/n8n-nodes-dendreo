import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	IHttpRequestMethods,
} from 'n8n-workflow';

// Helper function to get resource lists
async function getResourceList(
	this: ILoadOptionsFunctions,
	endpoint: string,
	idField: string,
	nameField: string | string[],
	resourceType: string,
	filter?: string
): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('dendreoApi');
	const baseUrl = `https://pro.dendreo.com/${credentials.slug}/api`;
	
	try {
		// Utilise une limite plus faible pour des performances optimales  
		const limit = filter ? 25 : 50; // Limite réduite pour éviter les timeouts
		
		const options = {
			method: 'GET' as IHttpRequestMethods,
			url: `${baseUrl}/${endpoint}`,
			headers: {
				'Accept': 'application/json',
			},
			json: true,
			qs: {
				limit: limit,
				...(filter && { search: filter }), // Utilise la recherche côté serveur si disponible
			},
		};

		const resources = await this.helpers.requestWithAuthentication.call(
			this,
			'dendreoApi',
			options,
		);

		if (Array.isArray(resources)) {
			let filteredResources = resources
				.filter((resource: any) => {
					// Build display name
					let displayName = '';
					if (Array.isArray(nameField)) {
						displayName = nameField
							.map(field => resource[field] || '')
							.filter(value => value.trim() !== '')
							.join(' ');
					} else {
						displayName = resource[nameField] || '';
					}
					return displayName.trim() !== '';
				})
				.map((resource: any) => {
					// Build display name
					let displayName = '';
					if (Array.isArray(nameField)) {
						displayName = nameField
							.map(field => resource[field] || '')
							.filter(value => value.trim() !== '')
							.join(' ');
					} else {
						displayName = resource[nameField] || '';
					}
					
					return {
						name: `${displayName} (ID: ${resource[idField]})`,
						value: resource[idField],
					};
				});

			// Apply search filter if provided and if not already filtered server-side
			if (filter) {
				filteredResources = filteredResources.filter(resource => 
					resource.name.toLowerCase().includes(filter.toLowerCase())
				);
			}

			// Limite les résultats pour éviter le surcharge de l'interface
			const maxResults = 25;
			if (filteredResources.length > maxResults) {
				filteredResources = filteredResources.slice(0, maxResults);
			}

			// Tri optimisé seulement sur les résultats limités
			filteredResources.sort((a, b) => a.name.localeCompare(b.name));

			return {
				results: filteredResources,
			};
		}
		
		return { results: [] };
	} catch (error) {
		return { results: [] };
	}
}

export class DendreoEnhanced implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dendreo',
		name: 'dendreo',
		icon: 'file:dendreo-new.svg',
		group: ['transform'],
		version: 2,
		description: 'Interact with Dendreo API - Optimized for performance',
		defaults: {
			name: 'Dendreo',
		},
		credentials: [
			{
				name: 'dendreoApi',
				required: true,
			},
		],
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Actions de Formation', value: 'actions_de_formation' },
					{ name: 'Catégories de Module', value: 'categories_module' },
					{ name: 'Catégories de Produit', value: 'categories_produit' },
					{ name: 'Catalogue Public (Sessions)', value: 'catalogue_prochaines_sessions' },
					{ name: 'Centres de Formation', value: 'centres_de_formation' },
					{ name: 'Contacts', value: 'contacts' },
					{ name: 'Créneaux', value: 'creneaux' },
					{ name: 'Entreprises', value: 'entreprises' },
					{ name: 'Étapes', value: 'etapes' },
					{ name: 'Factures', value: 'factures' },
					{ name: 'Formateurs', value: 'formateurs' },
					{ name: 'Liens Créneau-Formateur (LCF)', value: 'lcfs' },
					{ name: 'Modules/Produits', value: 'modules' },
					{ name: 'Participants', value: 'participants' },

									{ name: 'Salles de Formation', value: 'salles_de_formation' },
				{ name: 'Sessions Permanentes', value: 'sessions_permanentes' },
				],
				default: 'entreprises',
				description: 'The resource to operate on',
			},

			// Company Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['entreprises'],
					},
				},
				options: [
					{
						name: 'Get Many Companies',
						value: 'getMany',
						description: 'Get multiple companies',
						action: 'Get many companies',
					},
					{
						name: 'Get a Company',
						value: 'get',
						description: 'Get a company by ID',
						action: 'Get a company',
					},
					{
						name: 'Create a Company',
						value: 'create',
						description: 'Create a new company',
						action: 'Create a company',
					},
					{
						name: 'Update a Company',
						value: 'update',
						description: 'Update a company',
						action: 'Update a company',
					},
					{
						name: 'Delete a Company',
						value: 'delete',
						description: 'Delete a company',
						action: 'Delete a company',
					},
					{
						name: 'Search Companies',
						value: 'search',
						description: 'Search for companies',
						action: 'Search companies',
					},
					{
						name: 'Get Recently Updated Companies',
						value: 'getRecentlyUpdated',
						description: 'Get companies updated after a specific date',
						action: 'Get recently updated companies',
					},
				],
				default: 'getMany',
			},

			// Contact Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
					},
				},
				options: [
					{
						name: 'Get Many Contacts',
						value: 'getMany',
						description: 'Get multiple contacts',
						action: 'Get many contacts',
					},
					{
						name: 'Get a Contact',
						value: 'get',
						description: 'Get a contact by ID',
						action: 'Get a contact',
					},
					{
						name: 'Create or Update a Contact',
						value: 'createOrUpdate',
						description: 'Create or update a contact',
						action: 'Create or update a contact',
					},
					{
						name: 'Delete a Contact',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Search Contacts',
						value: 'search',
						description: 'Search for contacts',
						action: 'Search contacts',
					},
					{
						name: 'Get Recently Updated Contacts',
						value: 'getRecentlyUpdated',
						description: 'Get contacts updated after a specific date',
						action: 'Get recently updated contacts',
					},
				],
				default: 'getMany',
			},

			// Training Action Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
					},
				},
				options: [
					{
						name: 'Get Many Training Actions',
						value: 'getMany',
						description: 'Get multiple training actions',
						action: 'Get many training actions',
					},
					{
						name: 'Get a Training Action',
						value: 'get',
						description: 'Get a training action by ID',
						action: 'Get a training action',
					},
					{
						name: 'Create a Training Action',
						value: 'create',
						description: 'Create a new training action',
						action: 'Create a training action',
					},
					{
						name: 'Update a Training Action',
						value: 'update',
						description: 'Update a training action',
						action: 'Update a training action',
					},
					{
						name: 'Delete a Training Action',
						value: 'delete',
						description: 'Delete a training action',
						action: 'Delete a training action',
					},
					{
						name: 'Search Training Actions',
						value: 'search',
						description: 'Search for training actions',
						action: 'Search training actions',
					},
				],
				default: 'getMany',
			},

			// Participants Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['participants'],
					},
				},
				options: [
					{
						name: 'Get Many Participants',
						value: 'getMany',
						description: 'Get multiple participants',
						action: 'Get many participants',
					},
					{
						name: 'Get a Participant',
						value: 'get',
						description: 'Get a participant by ID',
						action: 'Get a participant',
					},
					{
						name: 'Create a Participant',
						value: 'create',
						description: 'Create a new participant',
						action: 'Create a participant',
					},
					{
						name: 'Update a Participant',
						value: 'update',
						description: 'Update a participant',
						action: 'Update a participant',
					},
					{
						name: 'Delete a Participant',
						value: 'delete',
						description: 'Delete a participant',
						action: 'Delete a participant',
					},
					{
						name: 'Search Participants',
						value: 'search',
						description: 'Search for participants',
						action: 'Search participants',
					},
				],
				default: 'getMany',
			},

			// Modules Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['modules'],
					},
				},
				options: [
					{
						name: 'Get Many Modules',
						value: 'getMany',
						description: 'Get multiple modules',
						action: 'Get many modules',
					},
					{
						name: 'Get a Module',
						value: 'get',
						description: 'Get a module by ID',
						action: 'Get a module',
					},
					{
						name: 'Create a Module',
						value: 'create',
						description: 'Create a new module',
						action: 'Create a module',
					},
					{
						name: 'Update a Module',
						value: 'update',
						description: 'Update a module',
						action: 'Update a module',
					},
					{
						name: 'Delete a Module',
						value: 'delete',
						description: 'Delete a module',
						action: 'Delete a module',
					},
					{
						name: 'Search Modules',
						value: 'search',
						description: 'Search for modules',
						action: 'Search modules',
					},
				],
				default: 'getMany',
			},

			// Generic Operations for other resources
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					hide: {
						resource: ['entreprises', 'contacts', 'actions_de_formation', 'sessions_permanentes', 'modules', 'participants', 'factures', 'formateurs'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getMany',
						description: 'Get multiple records',
						action: 'Get many records',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record by ID',
						action: 'Get a record',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new record',
						action: 'Create a record',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
						action: 'Update a record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search for records',
						action: 'Search records',
					},
				],
				default: 'getMany',
			},

			// ID Field for Get/Update/Delete operations
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['entreprises'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the company',
			},
			{
				displayName: 'Contact',
				name: 'contactId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a contact...',
						typeOptions: {
							searchListMethod: 'getContacts',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[0-9]+',
									errorMessage: 'Contact ID must be a number',
								},
							},
						],
					},
				],
				description: 'The contact to work with',
			},

			// Training Action ID
			{
				displayName: 'Training Action',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a training action...',
						typeOptions: {
							searchListMethod: 'getTrainingActions',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The training action to work with',
			},

			// Session ID
			{
				displayName: 'Session',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['sessions_permanentes'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a session...',
						typeOptions: {
							searchListMethod: 'getSessions',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The session to work with',
			},

			// Module ID
			{
				displayName: 'Module',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['modules'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a module...',
						typeOptions: {
							searchListMethod: 'getModules',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The module to work with',
			},

			// Participant ID
			{
				displayName: 'Participant',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a participant...',
						typeOptions: {
							searchListMethod: 'getParticipants',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The participant to work with',
			},

			// Company ID for companies resource
			{
				displayName: 'Company',
				name: 'companyId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['entreprises'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a company...',
						typeOptions: {
							searchListMethod: 'getCompanies',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The company to work with',
			},

			// Invoice ID
			{
				displayName: 'Invoice',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['factures'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select an invoice...',
						typeOptions: {
							searchListMethod: 'getInvoices',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The invoice to work with',
			},

			// Trainer ID
			{
				displayName: 'Trainer',
				name: 'recordId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['formateurs'],
						operation: ['get', 'update', 'delete'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a trainer...',
						typeOptions: {
							searchListMethod: 'getTrainers',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The trainer to work with',
			},

			// Generic Record ID for other resources
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
					},
					hide: {
						resource: ['entreprises', 'contacts', 'actions_de_formation', 'sessions_permanentes', 'modules', 'participants', 'factures', 'formateurs'],
					},
				},
				default: '',
				description: 'The ID of the record',
			},

			// Search Term Field for generic resources
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['search'],
					},
					hide: {
						resource: ['entreprises', 'contacts', 'actions_de_formation', 'sessions_permanentes', 'modules', 'participants', 'factures', 'formateurs'],
					},
				},
				default: '',
				description: 'The term to search for',
			},

			// ===== TRAINING ROOM FIELDS =====
			{
				displayName: 'Room Title',
				name: 'roomTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['salles_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Training room title (intitule)',
			},
			{
				displayName: 'Location Type',
				name: 'roomLocationType',
				type: 'options',
				options: [
					{ name: 'Internal', value: 'interne' },
					{ name: 'External', value: 'externe' },
					{ name: 'Client Site', value: 'client' },
				],
				displayOptions: {
					show: {
						resource: ['salles_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: 'interne',
				description: 'Target location (emplacement_cible)',
			},

			// ===== TRAINING CENTER FIELDS =====
			{
				displayName: 'Center Name',
				name: 'centerName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['centres_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Training center name',
			},

			// ===== CATEGORY FIELDS =====
			{
				displayName: 'Category Title',
				name: 'categoryTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['categories_module', 'categories_produit'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Category title (intitule)',
			},
			{
				displayName: 'Category Description',
				name: 'categoryDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['categories_module', 'categories_produit'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Category description',
			},
			{
				displayName: 'Category Color',
				name: 'categoryColor',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['categories_module'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Category color (hex code)',
			},

			// ===== TIME SLOT FIELDS =====
			{
				displayName: 'Date',
				name: 'slotDate',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						resource: ['creneaux'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Slot date (YYYY-MM-DD)',
			},
			{
				displayName: 'Start Time',
				name: 'slotStartTime',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['creneaux'],
						operation: ['create', 'update'],
					},
				},
				default: '09:00',
				description: 'Start time (HH:MM)',
			},
			{
				displayName: 'End Time',
				name: 'slotEndTime',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['creneaux'],
						operation: ['create', 'update'],
					},
				},
				default: '17:00',
				description: 'End time (HH:MM)',
			},

			// Generic data field for create/update of other resources
			{
				displayName: 'Data (JSON)',
				name: 'data',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
					hide: {
						resource: ['entreprises', 'contacts', 'actions_de_formation', 'sessions_permanentes', 'modules', 'participants', 'factures', 'formateurs', 'salles_de_formation', 'centres_de_formation', 'categories_module', 'categories_produit', 'creneaux'],
					},
				},
				description: 'JSON data for the record',
			},

			// Search Term Field for specific resources
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['search'],
						resource: ['entreprises', 'contacts', 'actions_de_formation', 'sessions_permanentes', 'modules', 'participants', 'factures', 'formateurs'],
					},
				},
				default: '',
				description: 'The term to search for',
			},

			// Recently Updated Date Field
			{
				displayName: 'Updated After',
				name: 'updatedAfter',
				type: 'dateTime',
				required: true,
				displayOptions: {
					show: {
						operation: ['getRecentlyUpdated'],
					},
				},
				default: '',
				description: 'Get records updated after this date and time',
			},

			// Data Fields for Create/Update Operations
			{
				displayName: 'Company Properties',
				name: 'companyProperties',
				placeholder: 'Add Property',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['entreprises'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: {},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Property name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value',
							},
						],
					},
				],
			},
			// Company selection for contact creation
			{
				displayName: 'Company Selection',
				name: 'companySelection',
				type: 'options',
				options: [
					{
						name: 'Select Existing Company',
						value: 'existing',
						description: 'Choose from existing companies',
					},
					{
						name: 'Create New Company',
						value: 'new',
						description: 'Create a new company for this contact',
					},
				],
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'createOrUpdate'],
					},
				},
				default: 'existing',
				description: 'Choose to select an existing company or create a new one',
			},

			// Company ID field for existing company selection
			{
				displayName: 'Company',
				name: 'companyIdForContact',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'createOrUpdate'],
						companySelection: ['existing'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a company...',
						typeOptions: {
							searchListMethod: 'getCompanies',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: '[0-9]+',
									errorMessage: 'Company ID must be a number',
								},
							},
						],
					},
				],
				description: 'The company to associate this contact with',
			},

			// New company fields
			{
				displayName: 'New Company Name',
				name: 'newCompanyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'createOrUpdate'],
						companySelection: ['new'],
					},
				},
				default: '',
				description: 'Name of the new company to create',
			},
			{
				displayName: 'New Company Email',
				name: 'newCompanyEmail',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'createOrUpdate'],
						companySelection: ['new'],
					},
				},
				default: '',
				description: 'Email of the new company (optional)',
			},
			{
				displayName: 'New Company Phone',
				name: 'newCompanyPhone',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'createOrUpdate'],
						companySelection: ['new'],
					},
				},
				default: '',
				description: 'Phone of the new company (optional)',
			},
			
			// Contact specific fields
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: '',
				description: 'Contact last name',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: '',
				description: 'Contact first name',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: '',
				description: 'Contact email address',
			},
			{
				displayName: 'Title',
				name: 'civilite',
				type: 'options',
				options: [
					{ name: 'Mr.', value: 'M.' },
					{ name: 'Mrs.', value: 'Mme' },
					{ name: 'Ms.', value: 'Mlle' },
				],
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: 'M.',
				description: 'Contact title/civility',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: '',
				description: 'Contact phone number',
			},

			// ===== PARTICIPANT CREATION FIELDS =====

			// Company selection for participant creation
			{
				displayName: 'Company Selection',
				name: 'participantCompanySelection',
				type: 'options',
				options: [
					{
						name: 'Select Existing Company',
						value: 'existing',
						description: 'Choose from existing companies',
					},
					{
						name: 'Create New Company',
						value: 'new',
						description: 'Create a new company for this participant',
					},
				],
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
					},
				},
				default: 'existing',
				description: 'Choose to select an existing company or create a new one',
			},

			// Company for participant
			{
				displayName: 'Company',
				name: 'participantCompany',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
						participantCompanySelection: ['existing'],
					},
				},
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						placeholder: 'Select a company...',
						typeOptions: {
							searchListMethod: 'getCompanies',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. 123',
					},
				],
				description: 'The company to associate this participant with',
			},

			// New company name for participants
			{
				displayName: 'New Company Name',
				name: 'newParticipantCompanyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create'],
						participantCompanySelection: ['new'],
					},
				},
				default: '',
				description: 'Name of the new company to create',
			},

			// Participant specific fields
			{
				displayName: 'Participant Last Name',
				name: 'participantLastName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Participant last name',
			},
			{
				displayName: 'Participant First Name',
				name: 'participantFirstName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Participant first name',
			},
			{
				displayName: 'Participant Email',
				name: 'participantEmail',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['participants'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Participant email address',
			},

			// ===== MODULE CREATION FIELDS =====

			{
				displayName: 'Module Title',
				name: 'moduleTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['modules'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Module title (intitule)',
			},

			// ===== TRAINING ACTION FIELDS =====
			{
				displayName: 'Training Action Title',
				name: 'trainingActionTitle',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Training action title (intitule)',
			},
			{
				displayName: 'Training Type',
				name: 'trainingType',
				type: 'options',
				options: [
					{ name: 'Inter-company', value: 'inter' },
					{ name: 'Intra-company', value: 'intra' },
					{ name: 'Non-training', value: 'hors_formation' },
				],
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: 'inter',
				description: 'Type of training',
			},
			{
				displayName: 'Start Date',
				name: 'trainingStartDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Training start date',
			},
			{
				displayName: 'End Date',
				name: 'trainingEndDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['actions_de_formation'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Training end date',
			},

			{
				displayName: 'Additional Contact Properties',
				name: 'contactProperties',
				placeholder: 'Add Property',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['create', 'update', 'createOrUpdate'],
					},
				},
				default: {},
				options: [
					{
						name: 'property',
						displayName: 'Property',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Property name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Property value',
							},
						],
					},
				],
			},

			// Additional Options
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['getMany', 'search', 'getRecentlyUpdated'],
					},
				},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 100,
						description: 'Maximum number of results to return',
						typeOptions: {
							minValue: 1,
							maxValue: 1000,
						},
					},
					{
						displayName: 'Include Associations',
						name: 'include',
						type: 'string',
						default: '',
						description: 'Comma-separated list of associations to include',
					},
					{
						displayName: 'Request Delay (ms)',
						name: 'requestDelay',
						type: 'number',
						default: 0,
						description: 'Delay between requests in milliseconds',
						typeOptions: {
							minValue: 0,
							maxValue: 5000,
						},
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async getCompanies(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'entreprises.php', 'id_entreprise', 'raison_sociale', 'Company', filter);
			},

			async getContacts(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'contacts.php', 'id_contact', ['nom', 'prenom'], 'Contact', filter);
			},

			async getTrainingActions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'actions_de_formation.php', 'id_action_de_formation', 'intitule', 'Training Action', filter);
			},

			async getSessions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'sessions_permanentes.php', 'id_session_permanente', 'nom', 'Session', filter);
			},

			async getModules(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'modules.php', 'id_module', 'intitule', 'Module', filter);
			},

			async getCategoriesProduit(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'categories_produit.php', 'id_categorie_produit', 'intitule', 'Product Category', filter);
			},

			async getCategoriesModule(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'categories_module.php', 'id_categorie_module', 'intitule', 'Module Category', filter);
			},

			async getCataloguePublicSessions(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'catalogue_prochaines_sessions.php', 'id_action_de_formation', 'intitule', 'Public Session', filter);
			},

			async getTrainers(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'formateurs.php', 'id_formateur', ['nom', 'prenom'], 'Trainer', filter);
			},

			async getParticipants(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'participants.php', 'id_participant', ['nom', 'prenom'], 'Participant', filter);
			},

			async getInvoices(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'factures.php', 'id_facture', 'numero', 'Invoice', filter);
			},

			async getTrainingRooms(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'salles_de_formation.php', 'id_salle_de_formation', 'intitule', 'Training Room', filter);
			},

			async getTrainingCenters(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'centres_de_formation.php', 'id_centre_de_formation', 'raison_sociale', 'Training Center', filter);
			},

			async getTimeSlots(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'creneaux.php', 'id_creneau', 'date_debut', 'Time Slot', filter);
			},

			async getSteps(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'etapes.php', 'id_etape_process', 'intitule', 'Step', filter);
			},

			async getLaps(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'laps.php', 'id_lap', 'nom', 'LAP', filter);
			},

			async getLafs(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'lafs.php', 'id_laf', 'nom', 'LAF', filter);
			},

			async getLaes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'laes.php', 'id_lae', 'nom', 'LAE', filter);
			},

			async getLcfs(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'lcfs.php', 'id_lcf', 'nom', 'LCF', filter);
			},

			async getSatisfactionSurveys(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return await getResourceList.call(this, 'reponses_questionnaire_satisfaction.php', 'id_reponse', 'nom', 'Survey Response', filter);
			},

			
		},
	};



	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Resource endpoint mapping (based on official OpenAPI spec)
		const resourceEndpoints: { [key: string]: string } = {
			actions_de_formation: 'actions_de_formation.php',
			categories_module: 'categories_module.php',
			categories_produit: 'categories_produit.php',
			catalogue_prochaines_sessions: 'catalogue_prochaines_sessions.php',
			centres_de_formation: 'centres_de_formation.php',
			contacts: 'contacts.php',
			creneaux: 'creneaux.php',
			entreprises: 'entreprises.php',
			etapes: 'etapes.php',
			factures: 'factures.php',
			formateurs: 'formateurs.php',
			laps: 'laps.php', // Inscriptions
			lafs: 'lafs.php', // Interventions Formateur
			laes: 'laes.php', // Liens ADF-Entreprise
			lcfs: 'lcfs.php', // Liens Créneau-Formateur
			modules: 'modules.php',
			participants: 'participants.php',
			reponses_questionnaire_satisfaction: 'reponses_questionnaire_satisfaction.php',
			salles_de_formation: 'salles_de_formation.php',
			sessions_permanentes: 'sessions_permanentes.php',

		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

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

				// Handle operation-specific logic
				switch (operation) {
					case 'getMany':
					case 'list':
						method = 'GET';
						if (additionalFields.limit) {
							qs.limit = additionalFields.limit;
						}
						if (additionalFields.include) {
							qs.include = additionalFields.include;
						}
						break;

					case 'get':
						method = 'GET';
						let recordId: string;
						
						if (resource === 'entreprises') {
							recordId = this.getNodeParameter('companyId', i) as string;
						} else if (resource === 'contacts') {
							const contactLocator = this.getNodeParameter('contactId', i) as IDataObject;
							recordId = contactLocator.value as string;
						} else if (['actions_de_formation', 'sessions_permanentes', 'modules'].includes(resource)) {
							const resourceLocator = this.getNodeParameter('recordId', i) as IDataObject;
							recordId = resourceLocator.value as string;
						} else {
							recordId = this.getNodeParameter('recordId', i) as string;
						}
						
						if (!recordId) {
							throw new NodeOperationError(this.getNode(), 'ID is required for get operation', { itemIndex: i });
						}
						qs.id = recordId;
						break;

					case 'search':
						method = 'GET';
						const searchTerm = this.getNodeParameter('searchTerm', i) as string;
						qs.search = searchTerm;
						if (additionalFields.limit) {
							qs.limit = additionalFields.limit;
						}
						break;

					case 'getRecentlyUpdated':
						method = 'GET';
						const updatedAfter = this.getNodeParameter('updatedAfter', i) as string;
						qs.updated_after = new Date(updatedAfter).toISOString();
						if (additionalFields.limit) {
							qs.limit = additionalFields.limit;
						}
						break;

					case 'create':
					case 'createOrUpdate':
						method = 'POST';
						
						if (resource === 'entreprises') {
							const companyProperties = this.getNodeParameter('companyProperties', i, {}) as IDataObject;
							if (companyProperties.property) {
								body = {};
								(companyProperties.property as IDataObject[]).forEach((prop: IDataObject) => {
									if (prop.name && prop.value) {
										body![prop.name as string] = prop.value;
									}
								});
							}
						} else if (resource === 'contacts') {
							// Handle company selection/creation
							const companySelection = this.getNodeParameter('companySelection', i) as string;
							let companyId: string;
							
							if (companySelection === 'new') {
								// Create new company first
								const newCompanyName = this.getNodeParameter('newCompanyName', i) as string;
								const newCompanyEmail = this.getNodeParameter('newCompanyEmail', i, '') as string;
								const newCompanyPhone = this.getNodeParameter('newCompanyPhone', i, '') as string;
								
								const companyBody: IDataObject = {
									nom: newCompanyName,
								};
								
								if (newCompanyEmail) companyBody.email = newCompanyEmail;
								if (newCompanyPhone) companyBody.telephone = newCompanyPhone;
								
								const companyOptions = {
									method: 'POST' as IHttpRequestMethods,
									url: `${baseUrl}/entreprises.php`,
									headers: { 'Accept': 'application/json' },
									json: true,
									body: companyBody,
								};
								
								// Add delay to respect rate limiting
								const requestDelay = additionalFields.requestDelay as number || 0;
								if (requestDelay > 0) {
									await new Promise(resolve => setTimeout(resolve, requestDelay));
								}
								
								const newCompany = await this.helpers.requestWithAuthentication.call(
									this,
									'dendreoApi',
									companyOptions,
								);
								
								companyId = newCompany.id_entreprise;
							} else {
								// Use existing company
								const companyResourceLocator = this.getNodeParameter('companyIdForContact', i) as IDataObject;
								companyId = companyResourceLocator.value as string;
							}
							
							// Build contact data with required fields
							body = {};
							
							// Required fields
							const lastName = this.getNodeParameter('lastName', i) as string;
							const firstName = this.getNodeParameter('firstName', i) as string;
							
							body.id_entreprise = companyId;
							body.nom = lastName;
							body.prenom = firstName;
							
							// Optional fields
							const email = this.getNodeParameter('email', i, '') as string;
							const civilite = this.getNodeParameter('civilite', i, 'M.') as string;
							const phone = this.getNodeParameter('phone', i, '') as string;
							
							if (email) body.email = email;
							if (civilite) body.civilite = civilite;
							if (phone) body.telephone_direct = phone;
							
							// Additional properties
							const contactProperties = this.getNodeParameter('contactProperties', i, {}) as IDataObject;
							if (contactProperties.property) {
								(contactProperties.property as IDataObject[]).forEach((prop: IDataObject) => {
									if (prop.name && prop.value) {
										body![prop.name as string] = prop.value;
									}
								});
							}
						} else if (resource === 'participants') {
							// Handle company selection/creation for participants
							const participantCompanySelection = this.getNodeParameter('participantCompanySelection', i, 'existing') as string;
							let companyId: string;
							
							if (participantCompanySelection === 'new') {
								// Create new company first
								const newCompanyName = this.getNodeParameter('newParticipantCompanyName', i) as string;
								
								const companyBody: IDataObject = {
									raison_sociale: newCompanyName,
								};
								
								const companyOptions = {
									method: 'POST' as IHttpRequestMethods,
									url: `${baseUrl}/entreprises.php`,
									headers: { 'Accept': 'application/json' },
									json: true,
									body: companyBody,
								};
								
								const requestDelay = additionalFields.requestDelay as number || 0;
								if (requestDelay > 0) {
									await new Promise(resolve => setTimeout(resolve, requestDelay));
								}
								
								const newCompany = await this.helpers.requestWithAuthentication.call(
									this,
									'dendreoApi',
									companyOptions,
								);
								
								companyId = newCompany.id_entreprise;
							} else {
								// Use existing company
								const companyResourceLocator = this.getNodeParameter('participantCompany', i) as IDataObject;
								companyId = companyResourceLocator.value as string;
							}
							
							// Build participant data
							body = {};
							
							// Required fields
							const lastName = this.getNodeParameter('participantLastName', i) as string;
							const firstName = this.getNodeParameter('participantFirstName', i) as string;
							
							body.id_entreprise = companyId;
							body.nom = lastName;
							body.prenom = firstName;
							
							// Optional fields
							const email = this.getNodeParameter('participantEmail', i, '') as string;
							if (email) body.email = email;
							
						} else if (resource === 'actions_de_formation') {
							// Build training action data
							body = {};
							
							const title = this.getNodeParameter('trainingActionTitle', i) as string;
							const type = this.getNodeParameter('trainingType', i) as string;
							const startDate = this.getNodeParameter('trainingStartDate', i, '') as string;
							const endDate = this.getNodeParameter('trainingEndDate', i, '') as string;
							
							body.intitule = title;
							body.type = type;
							
							if (startDate) {
								const startDateObj = new Date(startDate);
								body.date_debut = startDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
							}
							
							if (endDate) {
								const endDateObj = new Date(endDate);
								body.date_fin = endDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
							}
							
						} else if (resource === 'modules') {
							// Build module data
							body = {};
							
							const moduleTitle = this.getNodeParameter('moduleTitle', i) as string;
							body.intitule = moduleTitle;
						} else if (resource === 'salles_de_formation') {
							// Build training room data
							body = {};
							
							const roomTitle = this.getNodeParameter('roomTitle', i) as string;
							const locationType = this.getNodeParameter('roomLocationType', i) as string;
							
							body.intitule = roomTitle;
							body.emplacement_cible = locationType;
						} else if (resource === 'centres_de_formation') {
							// Build training center data
							body = {};
							
							const centerName = this.getNodeParameter('centerName', i) as string;
							body.nom = centerName;
						} else if (['categories_module', 'categories_produit'].includes(resource)) {
							// Build category data
							body = {};
							
							const categoryTitle = this.getNodeParameter('categoryTitle', i) as string;
							const categoryDescription = this.getNodeParameter('categoryDescription', i, '') as string;
							
							body.intitule = categoryTitle;
							if (categoryDescription) body.description = categoryDescription;
							
							if (resource === 'categories_module') {
								const categoryColor = this.getNodeParameter('categoryColor', i, '') as string;
								if (categoryColor) body.color = categoryColor;
							}
						} else if (resource === 'creneaux') {
							// Build time slot data
							body = {};
							
							const slotDate = this.getNodeParameter('slotDate', i) as string;
							const startTime = this.getNodeParameter('slotStartTime', i) as string;
							const endTime = this.getNodeParameter('slotEndTime', i) as string;
							
							// Convert datetime to date format
							const dateObj = new Date(slotDate);
							const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
							
							body.date = formattedDate;
							body.heure_debut = startTime;
							body.heure_fin = endTime;
						} else {
							// Generic resource handling
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
						}
						break;

					case 'update':
						method = 'POST';
						let updateId: string;
						
						if (resource === 'entreprises') {
							updateId = this.getNodeParameter('companyId', i) as string;
							const companyProperties = this.getNodeParameter('companyProperties', i, {}) as IDataObject;
							if (companyProperties.property) {
								body = { id: updateId };
								(companyProperties.property as IDataObject[]).forEach((prop: IDataObject) => {
									if (prop.name && prop.value) {
										body![prop.name as string] = prop.value;
									}
								});
							}
						} else if (resource === 'contacts') {
							const contactLocator = this.getNodeParameter('contactId', i) as IDataObject;
							updateId = contactLocator.value as string;
							body = { id: updateId };
							
							// Optional fields for update
							const lastName = this.getNodeParameter('lastName', i, '') as string;
							const firstName = this.getNodeParameter('firstName', i, '') as string;
							const email = this.getNodeParameter('email', i, '') as string;
							const civilite = this.getNodeParameter('civilite', i, '') as string;
							const phone = this.getNodeParameter('phone', i, '') as string;
							
							if (lastName) body.nom = lastName;
							if (firstName) body.prenom = firstName;
							if (email) body.email = email;
							if (civilite) body.civilite = civilite;
							if (phone) body.telephone_direct = phone;
							
							// Additional properties
							const contactProperties = this.getNodeParameter('contactProperties', i, {}) as IDataObject;
							if (contactProperties.property) {
								(contactProperties.property as IDataObject[]).forEach((prop: IDataObject) => {
									if (prop.name && prop.value) {
										body![prop.name as string] = prop.value;
									}
								});
							}
						} else if (['actions_de_formation', 'sessions_permanentes', 'modules'].includes(resource)) {
							const resourceLocator = this.getNodeParameter('recordId', i) as IDataObject;
							updateId = resourceLocator.value as string;
							body = { id: updateId };
						} else {
							// Generic resource handling
							updateId = this.getNodeParameter('recordId', i) as string;
							const data = this.getNodeParameter('data', i) as string;
							try {
								body = JSON.parse(data);
								(body as IDataObject).id = updateId;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									'Invalid JSON data provided',
									{ itemIndex: i }
								);
							}
						}
						break;

					case 'delete':
						method = 'DELETE';
						let deleteId: string;
						
						if (resource === 'entreprises') {
							deleteId = this.getNodeParameter('companyId', i) as string;
						} else if (resource === 'contacts') {
							const contactLocator = this.getNodeParameter('contactId', i) as IDataObject;
							deleteId = contactLocator.value as string;
						} else if (['actions_de_formation', 'sessions_permanentes', 'modules'].includes(resource)) {
							const resourceLocator = this.getNodeParameter('recordId', i) as IDataObject;
							deleteId = resourceLocator.value as string;
						} else {
							// Generic resource handling
							deleteId = this.getNodeParameter('recordId', i) as string;
						}
						
						if (!deleteId) {
							throw new NodeOperationError(this.getNode(), 'ID is required for delete operation', { itemIndex: i });
						}
						qs.id = deleteId;
						break;
				}

				// Add request delay if specified
				const requestDelay = additionalFields.requestDelay as number || 0;
				if (requestDelay > 0 && i > 0) {
					await new Promise(resolve => setTimeout(resolve, requestDelay));
				}

				const options: IDataObject = {
					method,
					url,
					headers: {
						'Accept': 'application/json',
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

					// Apply client-side limit if specified (since Dendreo API doesn't respect limit parameter)
					const limit = additionalFields.limit as number;
					if (limit && responseData.length > limit) {
						responseData = responseData.slice(0, limit);
					}

					responseData.forEach((item: any) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});

				} catch (error: any) {
					// Provide helpful error messages
					let errorMessage = `Dendreo ${resource}/${operation} failed: ${error.message}`;
					
					if (error.statusCode === 401) {
						errorMessage = `Authentication failed. Please check your API key and permissions.`;
					} else if (error.statusCode === 404) {
						errorMessage = `${resource} not found or endpoint doesn't exist.`;
					} else if (error.statusCode === 403) {
						errorMessage = `Permission denied. Please check your permissions for ${resource}.`;
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
