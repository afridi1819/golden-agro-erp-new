# GoldenAgro ERP (Manufacturer–Retailer)

ERP system that connects a **Manufacturer** and **Retailers** to manage inventory, purchases, production (BOM), orders, invoices, expenses, and dashboards.

## Repositories / Modules
This repo contains 3 apps:
- `AuthService/` — **.NET AuthService** (JWT auth, refresh tokens, role/approval workflow, admin manufacturer management)
- `business-api/` — **Java Spring Boot** Business API (ERP domain logic)
- `golden-agro-frontend/` — **React + Vite** frontend

## Key Features
### Authentication & Access Control
- JWT access tokens + refresh tokens
- Roles: `Admin`, `Manufacturer`, `Retailer`
- **Approval-based registration** (requested role must be approved within 24 hours)
- Bootstrap rule: the **first Manufacturer registration becomes Admin**

### ERP Modules (Business API)
- Suppliers, Raw Materials, Purchases, BOM, Production Orders
- Retailer Orders (dummy payment flow)
- Expenses + Dashboard analytics (sales, expenses, profit)

### UX Enhancements
- Show/hide password (eye icon)
- Supplier phone validation: digits only, 10 digits
- Login/Register hidden when already authenticated

## Architecture (High Level)
```
[React Frontend] ---> [AuthService (.NET)] ---> [Auth DB (MySQL)]
      |
      +-------------> [Business API (Spring)] -> [Business DB (MySQL)]
```

## Tech Stack
- Frontend: React, Vite, Tailwind, React Router, TanStack Query, Axios, Recharts
- Auth: ASP.NET Core, ASP.NET Identity, EF Core, MySQL (Pomelo)
- Backend: Spring Boot, Spring Security, Spring Data JPA, MySQL, jjwt

## Local Setup
### Prerequisites
- Node.js + npm
- .NET SDK (for `AuthService`)
- Java 17 (for `business-api`)
- MySQL server running locally

> Note: Maven (`mvn`) is required to build/run `business-api` from CLI.

### Databases
Create (or allow auto-create) these schemas:
- `goldenagro_auth`
- `goldenagro_business`

Current DB credentials and JWT secrets are stored in:
- `AuthService/appsettings.json`
- `business-api/src/main/resources/application.yml`

For production, move these values to environment variables or a secret manager.

## Running the Services (Windows / PowerShell)
### 1) AuthService (.NET)
```pwsh
# from repo root
cd AuthService

dotnet restore

dotnet run
```
Default URL used by frontend: `https://localhost:7075/api`

#### Apply EF Core migrations (AuthService)
This repo uses a local tool manifest for `dotnet-ef`:
```pwsh
# from repo root

dotnet tool restore

dotnet tool run dotnet-ef database update -p .\AuthService\AuthService.csproj -s .\AuthService\AuthService.csproj
```

### 2) Business API (Spring Boot)
```pwsh
# from repo root

mvn -f .\business-api\pom.xml spring-boot:run
```
Default URL used by frontend: `http://localhost:8080/api`

### 3) Frontend (React + Vite)
```pwsh
# from repo root

npm.cmd --prefix .\golden-agro-frontend install
npm.cmd --prefix .\golden-agro-frontend run dev
```
Default Vite URL: `http://localhost:5173`

## Registration & Approval Flow
1) **First ever Manufacturer** signup becomes **Admin** immediately (bootstrap).
2) After an Admin exists:
   - Manufacturer/Retailer signup creates **inactive user + approval request**.
   - User cannot login until approved.
3) Approvals UI:
   - Login as Admin/Manufacturer
   - Go to `Requests` page: `/app/users`

Approval permissions:
- Manufacturer requests: **Admin only**
- Retailer requests: **Admin or Manufacturer**

## Admin: Manage Manufacturers
Admin-only page: `/app/manufacturers`
- Create manufacturer
- Edit manufacturer profile
- Activate/Deactivate manufacturer

## Documentation Artifacts
Text-based documentation is in:
- `docs_txt/`

Includes:
- Requirements, diagrams (text only), DB design, architecture, testing plan, interview Q&A.

## Common Troubleshooting
### 401/403 from Business API
Usually means JWT mismatch or role mismatch. Check:
- `AuthService/appsettings.json` JWT issuer/audience/key
- `business-api/src/main/resources/application.yml` jwt.secret/issuer/audience

### NPM script execution policy error (Windows)
If `npm` fails due to PowerShell execution policy, use `npm.cmd`:
```pwsh
npm.cmd --prefix .\golden-agro-frontend run lint
```

## Contributing
- Keep changes small and focused.
- Run:
  - `dotnet build AuthService/AuthService.csproj`
  - `npm.cmd --prefix golden-agro-frontend run lint`
  - `npm.cmd --prefix golden-agro-frontend run build`
