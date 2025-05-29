## 1. Prerequisites

- node.js >= 18

Docker
- docker >=23.0.5 
- docker-compose >=2.24.6

---

## 2. Application structure 

```bash
RTC-test/
├── src/
│ ├── api/
| ├── common/
| ├── consumer/
| ├── docker/
| └── domain/
├── tests/
│ ├── api/
| ├── common/
| ├── consumer/
| └── domain/
├── docker-compose.yml
├── example.env
├── package-lock.json
├── README_SOLUTION.md
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── vite.config.ts

````

## 3. How to run

### Develop

```bash
npm install
npm run start:local
````

### Prod 
```bash
npm install
npm run build
npm run start
````
or
```bash
docker compose up --build
````

## 4. Testing

```bash
npm run test
````
## 5. Api

When application is running the below endpoint is exposed

- http://localhost:{port}/v1/client/state
    - default port is 4000