import { Router } from 'express'
import { openApiSpec } from '../openapi'

const router = Router()

router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec)
})

router.get('/docs', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AROM STUDIO API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' })
  </script>
</body>
</html>`)
})

export default router
