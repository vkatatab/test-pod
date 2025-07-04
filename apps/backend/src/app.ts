import 'pg'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { sequelize } from '@test-pod/database'
import passport from './config/passport'

import authRoutes from './routes/auth.routes'
import usersRoutes from './routes/users.routes'
import rolesRoutes from './routes/roles.routes'
import eventsRoutes from './routes/events.routes'
import reservationsRoutes from './routes/reservations.routes'
import statsRoutes from './routes/stats.routes'

const app: express.Application = express()

const corsOrigins = process.env.CORS_ORIGINS || 'http://localhost:3001'
const allowedOrigins = corsOrigins.split(',').map(origin => origin.trim())

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/reservations', reservationsRoutes)
app.use('/api/stats', statsRoutes)

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Ping' })
})

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Inicializa a conexão com o banco de dados
export const initDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    return true
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    return false
  }
}
export default app
