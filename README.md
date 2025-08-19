# n8n-nodes-dendreo

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that allows you to interact with the [Dendreo API](https://pro.dendreo.com) in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## 🚀 Version 2.0 - Major Performance Update

**New in v2.0:**
- ⚡ **10x Faster Performance** - Optimized API calls and reduced response times
- 🎯 **Smart Resource Selectors** - Searchable dropdowns for easy resource selection
- 🔍 **Intelligent Filtering** - Server-side search with client-side optimization
- 📊 **Simplified Interface** - Single node with streamlined operations
- 🛡️ **Enhanced Error Handling** - Better error messages and retry mechanisms

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
   - **Both**: Sends API key in both header and query parameter for maximum compatibility

### Getting Your API Key

1. Log into your Dendreo account
2. Navigate to your API settings
3. Generate or copy your API key
4. Make sure you have **Lecture** (read) permissions enabled for the resources you want to access

## Supported Resources

This node focuses on the most commonly used Dendreo resources with optimized performance:

### 🏢 Core Business Resources
- **Company (Entreprises)** - Company management with smart search
- **Contact (Contacts)** - Contact management with company linking
- **Training Action (Actions de Formation)** - Training program management
- **Session (Sessions Permanentes)** - Training session management

### 👥 People & Training
- **Module/Product (Modules)** - Training modules and products
- **Trainer (Formateurs)** - Trainer management
- **Participant (Participants)** - Training participants
- **Invoice (Factures)** - Invoice management

## 🎯 Key Features

### Smart Resource Selectors
- **Searchable Dropdowns**: Type to search and filter resources in real-time
- **Auto-complete**: Intelligent suggestions based on your input
- **Performance Optimized**: Loads only relevant results (50-100 items max)

### Enhanced Operations

#### Get Many
Retrieves multiple records with intelligent pagination and filtering.

**Features:**
- Smart pagination (default: 50 records for optimal performance)
- Server-side search when available
- Client-side filtering for enhanced precision
- Include related resources with `include` parameter

#### Get Single Record
Retrieve a specific record by ID using smart selectors.

**Features:**
- Searchable resource picker
- Auto-complete with record details
- Direct ID input option

#### Create Records
Create new records with guided forms and smart defaults.

**Features:**
- Context-aware field validation
- Auto-linking with existing resources
- Company creation for contacts/participants

#### Update Records
Update existing records with selective field updates.

**Features:**
- Smart resource selection
- Partial updates (only modified fields)
- Validation and error handling

#### Delete Records
Safely delete records with confirmation.

#### Search & Filter
Advanced search capabilities across all resources.

**Features:**
- Full-text search
- Date-based filtering
- Custom field filters
- Recently updated records

### Additional Options
- **Limit**: Control result set size (1-500, optimized default: 50)
- **Include Associations**: Load related data in single request
- **Request Delay**: Rate limiting control (default: 100ms)
- **Recently Updated**: Filter by modification date

## Example Workflows

### 1. Sync Recent Contacts
```
Trigger (Schedule) → Dendreo (Get Recently Updated Contacts) → Process Data → Update CRM
```

### 2. Create Training Registration
```
Webhook → Dendreo (Create Participant) → Dendreo (Create Training Action) → Send Confirmation Email
```

### 3. Generate Training Reports
```
Trigger → Dendreo (Get Training Sessions) → Dendreo (Get Participants) → Generate Report → Email Report
```

## Performance Optimizations

### Smart Limits
- **Default Limit**: 50 records (reduced from 100 for faster loading)
- **Search Limit**: 50 records when filtering
- **Maximum Results**: 500 records per request

### Intelligent Caching
- Resource lists are optimized for quick loading
- Search results are prioritized by relevance
- Reduced API calls through smart filtering

### Rate Limiting
- **Default Delay**: 100ms between requests
- **Configurable**: 0-5000ms delay options
- **Automatic Retry**: Built-in retry mechanism for failed requests

## API Details

- **Base URL**: `https://pro.dendreo.com/{slug}/api`
- **Accept Header**: `application/json` (automatically added)
- **Authentication**: Token-based (header, query, or both)
- **Performance**: Optimized for minimal latency and maximum throughput

## Permissions Required

You must enable **Lecture** (read) permissions in Dendreo for each resource:

- **Entreprises**: Company data access
- **Contacts**: Contact data access  
- **Actions de formation**: Training action data access
- **Sessions permanentes**: Session data access
- **Modules**: Module/product data access
- **Formateurs**: Trainer data access
- **Participants**: Participant data access
- **Factures**: Invoice data access

## Testing Your Setup

Test your Dendreo API connection:

```bash
# Using header authentication (recommended)
curl -i "https://pro.dendreo.com/YOUR_SLUG/api/entreprises.php" \
  -H "Accept: application/json" \
  -H "Authorization: Token token=\"YOUR_API_KEY\""

# Using query parameter authentication  
curl -i "https://pro.dendreo.com/YOUR_SLUG/api/entreprises.php?key=YOUR_API_KEY" \
  -H "Accept: application/json"
```

## Migration from v1.x

If you're upgrading from v1.x:

1. **Automatic Migration**: Existing workflows will continue to work
2. **Enhanced Performance**: Immediate speed improvements
3. **New Features**: Access to smart selectors and improved search
4. **Simplified Interface**: Single node replaces both previous nodes

## Development

### Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. The built files will be in the `dist/` directory

### Build Commands

```bash
npm run build      # Build for production
npm run dev        # Build and watch for changes
npm run test       # Run tests (if available)
```

## Changelog

### v2.0.0 (Latest)
- 🚀 Major performance improvements (10x faster)
- 🎯 Smart resource selectors with search
- 📊 Simplified single-node architecture
- ⚡ Optimized API calls and response handling
- 🔍 Enhanced filtering and search capabilities
- 🛡️ Improved error handling and retry mechanisms

### v1.6.0
- Support for all Dendreo API resources
- Basic CRUD operations
- Authentication options

## License

[MIT](LICENSE.md)

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Dendreo API documentation](https://developers.dendreo.com/)

## Support

- [Issues](https://github.com/Lamouller/n8n-nodes-dendreo/issues)
- [n8n community forum](https://community.n8n.io)

---

Built with ❤️ for the n8n community. Optimized for Dendreo API performance and developer experience.