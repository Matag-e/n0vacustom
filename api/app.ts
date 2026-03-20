/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { ZodError } from 'zod'
import authRoutes from './routes/auth.js'
import paymentRoutes from './routes/payments.js'
import emailRoutes from './routes/emails.js'
import sitemapRoutes from './routes/sitemap.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()
console.log('[API] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Definida' : 'NÃO DEFINIDA')

const app: express.Application = express()

app.set('trust proxy', 1)

// Swagger configuration (only in dev)
if (process.env.NODE_ENV !== 'production') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Nova Custom API',
        version: '1.0.0',
        description: 'API para o e-commerce Nova Custom',
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Servidor de Desenvolvimento',
        },
      ],
    },
    apis: ['./api/routes/*.ts', './api/routes/*.js'],
  }

  const swaggerSpec = swaggerJsdoc(swaggerOptions)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Limit each IP to 600 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request) => req.path === '/payments/webhook',
  message: {
    success: false,
    error: 'Muitas requisições vindas deste IP, tente novamente mais tarde.',
  },
})

// Apply the rate limiting middleware to all requests
app.use('/api/', limiter)

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/emails', emailRoutes)
app.use('/api/sitemap', sitemapRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Dados de entrada inválidos',
      details: error.issues,
    })
  }

  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
