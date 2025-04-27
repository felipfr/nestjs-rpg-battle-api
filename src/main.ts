import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { buildCorsOptions, setupSwagger } from '~shared/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('RPG Battle API')
  const fastifyAdapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter)
  app.enableCors(buildCorsOptions())
  setupSwagger(app)
  const globalPrefix = process.env.API_PREFIX ?? '/api/v1'
  const port = process.env.API_PORT ?? '3000'
  app.setGlobalPrefix(globalPrefix)

  await app.listen(port, '0.0.0.0')
  logger.log(`Server running at http://localhost:${port}${globalPrefix}`)
}

void bootstrap()
