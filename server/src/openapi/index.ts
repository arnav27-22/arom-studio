export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'AROM STUDIO Admin API',
    version: '1.0.0',
    description: 'Enterprise admin panel API for AROM STUDIO',
  },
  servers: [
    { url: '/api', description: 'API base path' },
  ],
  paths: {
    '/admin/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with admin password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { password: { type: 'string' } }, required: ['password'] } } },
        },
        responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid password' }, '429': { description: 'Too many attempts' } },
      },
    },
    '/admin/auth/check': {
      post: { tags: ['Authentication'], summary: 'Check authentication status', responses: { '200': { description: 'Auth status' } } },
    },
    '/admin/auth/logout': {
      post: { tags: ['Authentication'], summary: 'Logout', responses: { '200': { description: 'Logged out' } } },
    },
    '/admin/dashboard/overview': {
      get: { tags: ['Dashboard'], summary: 'Get dashboard overview', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Dashboard overview' } } },
    },
    '/admin/dashboard/activity': {
      get: { tags: ['Dashboard'], summary: 'Get recent activity', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Recent activity' } } },
    },
    '/admin/statistics/dashboard': {
      get: { tags: ['Statistics'], summary: 'Get dashboard statistics', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Statistics' } } },
    },
    '/admin/statistics/analytics': {
      get: { tags: ['Statistics'], summary: 'Get page analytics', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Analytics' } } },
    },
    '/admin/visitors': {
      get: { tags: ['Visitors'], summary: 'Get all visitors', security: [{ cookieAuth: [] }], parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Visitor list' } } },
    },
    '/admin/leads': {
      get: { tags: ['Leads'], summary: 'Get all leads', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Lead list' } } },
      post: { tags: ['Leads'], summary: 'Create a lead', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Lead created' } } },
    },
    '/admin/pdfs': {
      get: { tags: ['PDFs'], summary: 'Get all PDFs', security: [{ cookieAuth: [] }], responses: { '200': { description: 'PDF list' } } },
    },
    '/admin/invoices': {
      get: { tags: ['Invoices'], summary: 'Get all invoices', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Invoice list' } } },
      post: { tags: ['Invoices'], summary: 'Create an invoice', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Invoice created' } } },
    },
    '/admin/projects': {
      get: { tags: ['Projects'], summary: 'Get all projects', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Project list' } } },
      post: { tags: ['Projects'], summary: 'Create a project', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Project created' } } },
    },
    '/admin/clients': {
      get: { tags: ['Clients'], summary: 'Get all clients', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Client list' } } },
      post: { tags: ['Clients'], summary: 'Create a client', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Client created' } } },
    },
    '/admin/notifications': {
      get: { tags: ['Notifications'], summary: 'Get notifications', security: [{ cookieAuth: [] }], parameters: [{ name: 'unread', in: 'query', schema: { type: 'boolean' } }], responses: { '200': { description: 'Notification list' } } },
    },
    '/admin/search': {
      get: { tags: ['Search'], summary: 'Global search', security: [{ cookieAuth: [] }], parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Search results' } } },
    },
    '/admin/recycle': {
      get: { tags: ['Recycle Bin'], summary: 'Get recycle bin items', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Recycle bin' } } },
    },
    '/admin/settings': {
      get: { tags: ['Settings'], summary: 'Get system settings', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Settings' } } },
    },
    '/admin/link-clicks': {
      get: { tags: ['Link Clicks'], summary: 'Get link click data', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Link click data' } } },
    },
    '/admin/logs': {
      get: { tags: ['Logs'], summary: 'Get audit logs', security: [{ cookieAuth: [] }], parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Audit logs' } } },
    },
    '/admin/discovery': {
      get: { tags: ['Discovery'], summary: 'Get discovery questionnaires', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Discovery list' } } },
    },
    '/health': {
      get: { tags: ['Health'], summary: 'Full health check', responses: { '200': { description: 'Health status' } } },
    },
    '/live': {
      get: { tags: ['Health'], summary: 'Liveness probe', responses: { '200': { description: 'Alive' } } },
    },
    '/ready': {
      get: { tags: ['Health'], summary: 'Readiness probe', responses: { '200': { description: 'Ready' }, '503': { description: 'Not ready' } } },
    },
    '/track/page-view': {
      post: { tags: ['Tracking'], summary: 'Track page view', responses: { '200': { description: 'OK' } } },
    },
    '/track/click': {
      post: { tags: ['Tracking'], summary: 'Track link click', responses: { '200': { description: 'OK' } } },
    },
    '/upload': {
      post: { tags: ['Storage'], summary: 'Upload a file', security: [{ cookieAuth: [] }], responses: { '200': { description: 'Upload result' } } },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'admin_token' },
      bearerAuth: { type: 'http', scheme: 'bearer' },
    },
  },
}

export { openApiSpec as default }
