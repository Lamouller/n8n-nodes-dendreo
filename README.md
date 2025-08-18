# n8n-nodes-dendreo

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that allows you to interact with the [Dendreo API](https://pro.dendreo.com) in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Click **Install** and enter: `n8n-nodes-dendreo-antislash`
3. Click **Install** and wait for the installation to complete

## Credentials

To use this node, you need to configure the Dendreo API credentials:

1. **Dendreo Slug**: Your organization slug found in your Dendreo URL (e.g., `your_org` from `https://pro.dendreo.com/your_org/`)
2. **API Key**: Your Dendreo API key
3. **Authentication Mode**: Choose between:
   - **Header** (default): Sends API key in `Authorization: Token token="<API_KEY>"` header
   - **Query Parameter**: Sends API key as `?key=<API_KEY>` query parameter

### Getting Your API Key

1. Log into your Dendreo account
2. Navigate to your API settings
3. Generate or copy your API key
4. Make sure you have **Lecture** (read) permissions enabled for the resources you want to access

## Supported Resources

This node supports the following Dendreo resources (read-only):

- **Entreprises** (`entreprises.php`)
- **Contacts** (`contacts.php`) 
- **Actions de Formation** (`actions_de_formation.php`)
- **Sessions Permanentes** (`sessions_permanentes.php`)

## Operations

### List
Retrieves all records for the selected resource.

**Additional Fields:**
- **Include**: Comma-separated list of related resources to include
- **Updated After**: Only return records updated after this date
- **Limit**: Maximum number of records to return (1-1000, default: 100)
- **Page**: Page number for pagination (default: 1)

### Get
Retrieves a specific record by ID (if supported by the endpoint).

**Note**: Not all Dendreo endpoints support getting records by ID. If the get operation fails, use the list operation with appropriate filters instead.

## Example Usage

### List All Entreprises
1. Add a Dendreo node to your workflow
2. Select **Entreprises** as the resource
3. Select **List** as the operation
4. Configure any additional fields as needed

### Get Specific Entreprise
1. Add a Dendreo node to your workflow
2. Select **Entreprises** as the resource
3. Select **Get** as the operation
4. Enter the ID of the entreprise you want to retrieve

### List Recent Contacts
1. Add a Dendreo node to your workflow
2. Select **Contacts** as the resource
3. Select **List** as the operation
4. In Additional Fields, set **Updated After** to your desired date
5. Set **Limit** to control the number of results

## API Details

- **Base URL**: `https://pro.dendreo.com/{slug}/api`
- **Accept Header**: `application/json` (automatically added)
- **Authentication**: Token-based (header or query parameter)

## Permissions Required

You must enable **Lecture** (read) permissions in Dendreo for each resource you want to access:

- **Entreprises**: Enable read access for company data
- **Contacts**: Enable read access for contact data
- **Actions de formation**: Enable read access for training action data
- **Sessions permanentes**: Enable read access for permanent session data

Without proper permissions, you will receive a 401 Unauthorized error.

## Testing Your Setup

You can test your Dendreo API connection using cURL:

```bash
# Using header authentication
curl -i "https://pro.dendreo.com/YOUR_SLUG/api/entreprises.php" \\
  -H "Accept: application/json" \\
  -H "Authorization: Token token=\"YOUR_API_KEY\""

# Using query parameter authentication  
curl -i "https://pro.dendreo.com/YOUR_SLUG/api/entreprises.php?key=YOUR_API_KEY" \\
  -H "Accept: application/json"
```

Replace `YOUR_SLUG` with your actual Dendreo slug and `YOUR_API_KEY` with your actual API key.

## Development

### Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. The built files will be in the `dist/` directory

### Publishing to npm

```bash
npm login
npm publish --access public
```

## License

[MIT](LICENSE.md)

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Dendreo API documentation](https://pro.dendreo.com)

## Support

- [Issues](https://github.com/lamouller/n8n-nodes-dendreo/issues)
- [n8n community forum](https://community.n8n.io)
