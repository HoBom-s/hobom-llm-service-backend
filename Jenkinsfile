@Library('hobom-shared-lib') _
hobomPipeline(
  serviceName:    'dev-hobom-llm-service-backend',
  hostPort:       '50052',
  containerPort:  '50052',
  memory:         '512m',
  cpus:           '1',
  envPath:        '/etc/hobom-dev/dev-hobom-llm-service-backend/.env',
  addHost:        true,
  submodules:     true,
  extraPorts:     ['3000:3000'],
  smokeCheckPath: null
)
