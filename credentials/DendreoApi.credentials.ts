import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';

export class DendreoApi implements ICredentialType {
	name = 'dendreoApi';
	displayName = 'Dendreo API';
	documentationUrl = 'https://github.com/lamouller/n8n-nodes-dendreo';
	properties: INodeProperties[] = [
		{
			displayName: 'Dendreo Slug',
			name: 'slug',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'your_organization_slug',
			description: 'Your Dendreo organization slug (found in your Dendreo URL)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Dendreo API key',
		},
		{
			displayName: 'Authentication Mode',
			name: 'authMode',
			type: 'options',
			options: [
				{
					name: 'Header Only',
					value: 'header',
					description: 'Send API key in Authorization header only',
				},
				{
					name: 'Query Parameter Only',
					value: 'query',
					description: 'Send API key as query parameter only',
				},
				{
					name: 'Both Header and Query',
					value: 'both',
					description: 'Send API key in both Authorization header and query parameter',
				},
			],
			default: 'header',
			description: 'How to authenticate with the Dendreo API',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: any,
	): Promise<any> {
		const { apiKey, authMode } = credentials;

		// Always add Accept header
		requestOptions.headers = requestOptions.headers || {};
		requestOptions.headers['Accept'] = 'application/json';

		if (authMode === 'header' || authMode === 'both') {
			requestOptions.headers['Authorization'] = `Token token="${apiKey}"`;
		}
		
		if (authMode === 'query' || authMode === 'both') {
			requestOptions.qs = requestOptions.qs || {};
			requestOptions.qs.key = apiKey;
		}

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://pro.dendreo.com/{{$credentials.slug}}/api',
			url: '/entreprises.php',
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
		},
	};
}
