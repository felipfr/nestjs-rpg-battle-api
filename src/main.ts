import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('RPG Battle API')
  const fastifyAdapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))

  const isDev = process.env.NODE_ENV !== 'production'
  const corsOptions = {
    origin: isDev ? '*' : (process.env.CORS_ORIGIN?.split(',') ?? []),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 204,
  }
  app.enableCors(corsOptions)

  const config = new DocumentBuilder().setTitle('RPG Battle API').setDescription('').setVersion('1.0.0').build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  const path = process.env.SWAGGER_PREFIX ?? '/docs'
  SwaggerModule.setup(path, app, documentFactory)

  const globalPrefix = process.env.API_PREFIX ?? '/api/v1'
  const port = process.env.API_PORT ?? '3000'
  app.setGlobalPrefix(globalPrefix)
  await app.listen(port, '0.0.0.0')
  logger.log(`Server running at http://localhost:${port}${globalPrefix}`)
}

void bootstrap()
