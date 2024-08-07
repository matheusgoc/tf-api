# TF Shoes Store API

This is the web service API for Thaíza Francischini Shoes Store platform. It primary servers the [TF Web App](https://github.com/matheusgoc/tf-web-app) and [TF Mobile App](https://github.com/matheusgoc/tf-mobile-app). It is built with [Nest](https://github.com/nestjs/nest) framework on top of [TypeScript](https://www.typescriptlang.org/) and [Node](https://nodejs.org) runtime.

## Setup

```bash
$ bun install
```

## Run

```bash
# development
$ bun start

# watch mode
$ bun start:dev

# production mode
$ bun start:prod
```

## Build

```
$ bun run build
```

## Linter and Format

```bash
# lint
$ bun lint

# type
$ bun tsc

# prettier
$ bun format
```

## Test

```bash
# unit tests
$ bun run test -i

# unit tests watch mode
$ bun test:watch

# e2e tests
$ bun test:e2e

# test coverage
$ bun test:cov

# test debug
$ bun test:debug

# clear Jest cache
$ bunx jest --clearCache
```

> [!NOTE] Tip
> _Clear Jest cache if tests start oscilating from fail to success._

## Generators

[Nest CLI](https://docs.nestjs.com/cli/overview) comes with a set of useful commands. Here there are some handy ones:

```bash
# available commands
$ bun nest --help

# module
$ bun nest g mo <name> <optional path>

# controller
$ bun nest g co <name> <optional path>

# service
$ bun nest g s <name> <optional path>

# CRUD resource
$ bun nest g res <name>
```
