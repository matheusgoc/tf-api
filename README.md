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

## Authentication

The authentication is implemented at auth module on top of [Passport library](https://www.passportjs.org). It follows two main strategies:

- [passport-local](https://www.passportjs.org/packages/passport-local/):
  validates the username (email) and password

- [passport-jwt](https://www.passportjs.org/packages/passport-jwt/):
  validates a [JWT - JSON Web Token](https://jwt.io/)

### Sign-in endpoint

The endpoint that uses the `passport-local` strategy to sign in the user is:

```bash
POST /v1/auth/login

body: {
  "username": string,
  "password": string
}

response: {
	"access_token": string,
	"token_type": "Bearer",
	"expires_in": seconds,
	"user": User
}
```

### @UseGuards(JwtAuthGuard) protection

Once having the `access_token` the other endpoints on overall modules can be protetected with `@UseGuards(JwtAuthGuard)` guard annotation at either controller level or action method within the controller.

### @SkipAuth()

Actions within a protected controller might be skipped by `@SkipAuth()` annotation when needed, which will turn the endpoint public.
