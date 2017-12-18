## Introduction

This repo derived from [angularClass repo](https://github.com/AngularClass/angular-starter) is angular starter simplified without CI.Contrast to source files,this repo modifies some`npm commands`, add some meta data in `tslint.json` file and keeps almost files in `src/app` folder unchanged .

## installation

* node >= 4.2.1
* npm >= 3

```bash
npm install
```

## features

* webpack
* lazyload
* tslint
* unit-testing
* e2e-testing
* compodoc
* typedoc
* sass

## commands
#### 1.dev in real time
```bash
npm run start
```

#### 2.build for dev
```bash
npm run build
```
or
```bash
npm run build:dev
```

#### 3.build for prod
```bash
npm run build:prod
```
If necessary with aot
```bash
npm run build:prod:aot
```

#### 4. unit-testing
```bash
npm run unit
```

#### 5. e2e-testing
```bash
npm run e2e
```

#### 6. tslint
```bash
npm run tslint
```
