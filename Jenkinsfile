@Library('hobom-shared-lib') _
hobomPipeline(
  serviceName:    'dev-hobom-llm-service-backend',
  hostPort:       '50053',
  containerPort:  '50052',
  memory:         '512m',
  cpus:           '1',
  envPath:        '/etc/hobom-dev/dev-hobom-llm-service-backend/.env',
  addHost:        true,
  submodules:     false,
  extraVolumes:   ['/home/infra-admin/certs:/etc/grpc-tls:ro'],
  smokeCheckPath: null,
  liveHostPort:   '50063',
  liveEnvPath:    '/etc/hobom-live/live-hobom-llm-service-backend/.env'
)
