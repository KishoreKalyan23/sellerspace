# PROJECT_LOG

## Overview
This project is a Clean Architecture ASP.NET Core backend for a multi-vendor e-commerce platform targeting .NET 8. It is structured into Domain, Application, Infrastructure, and API layers to support both a vendor portal and a customer-facing product catalog.

## Layers completed

### Domain
- [ECommerce.Domain/Entities/Category.cs](ECommerce.Domain/Entities/Category.cs) — defines the Category entity with Id, Name, ParentCategoryId, and navigation properties for parent/children/products.
- [ECommerce.Domain/Entities/Vendor.cs](ECommerce.Domain/Entities/Vendor.cs) — defines the Vendor entity with Id, Name, Email, StoreName, PasswordHash, IsApproved, CreatedAt, and a products collection.
- [ECommerce.Domain/Entities/Customer.cs](ECommerce.Domain/Entities/Customer.cs) — defines the Customer entity with Id, Name, Email, PasswordHash, and CreatedAt.
- [ECommerce.Domain/Entities/Product.cs](ECommerce.Domain/Entities/Product.cs) — defines the Product entity with Id, VendorId, CategoryId, Name, Description, Price, Stock, ImageUrl, IsActive, CreatedAt, UpdatedAt, and vendor/category navigation properties.

Design decisions:
- Used the database-architecture names directly for entity properties and navigation relationships, including Id/CategoryId/VendorId/CustomerId, so the domain model matches the source schema.

Assumptions:
- The prompt did not require additional domain enums or value objects, so none were introduced.

### Application
- [ECommerce.Application/Interfaces/Repositories/IProductRepository.cs](ECommerce.Application/Interfaces/Repositories/IProductRepository.cs) — defines repository methods for listing, retrieving, searching, vendor-scoped reads, adding, updating, and soft-deleting products.
- [ECommerce.Application/Interfaces/Repositories/ICategoryRepository.cs](ECommerce.Application/Interfaces/Repositories/ICategoryRepository.cs) — defines category retrieval operations.
- [ECommerce.Application/Interfaces/Repositories/IVendorRepository.cs](ECommerce.Application/Interfaces/Repositories/IVendorRepository.cs) — defines vendor lookup and creation operations.
- [ECommerce.Application/Interfaces/Repositories/ICustomerRepository.cs](ECommerce.Application/Interfaces/Repositories/ICustomerRepository.cs) — defines customer lookup and creation operations.
- [ECommerce.Application/Interfaces/Services/IProductService.cs](ECommerce.Application/Interfaces/Services/IProductService.cs) — defines product service contracts for customer reads, vendor reads, creation, update, delete, and image upload.
- [ECommerce.Application/Interfaces/Services/IVendorService.cs](ECommerce.Application/Interfaces/Services/IVendorService.cs) — defines vendor registration and login service contracts.
- [ECommerce.Application/DTOs/ProductListItemDto.cs](ECommerce.Application/DTOs/ProductListItemDto.cs) — DTO for customer-facing and vendor-facing product list items.
- [ECommerce.Application/DTOs/ProductDetailDto.cs](ECommerce.Application/DTOs/ProductDetailDto.cs) — DTO for single product details.
- [ECommerce.Application/DTOs/CategoryDto.cs](ECommerce.Application/DTOs/CategoryDto.cs) — DTO for category tree data.
- [ECommerce.Application/DTOs/CreateProductRequestDto.cs](ECommerce.Application/DTOs/CreateProductRequestDto.cs) — request DTO for creating products.
- [ECommerce.Application/DTOs/UpdateProductRequestDto.cs](ECommerce.Application/DTOs/UpdateProductRequestDto.cs) — request DTO for updating products.
- [ECommerce.Application/DTOs/VendorRegistrationRequestDto.cs](ECommerce.Application/DTOs/VendorRegistrationRequestDto.cs) — request DTO for vendor registration.
- [ECommerce.Application/DTOs/VendorLoginRequestDto.cs](ECommerce.Application/DTOs/VendorLoginRequestDto.cs) — request DTO for vendor login.
- [ECommerce.Application/DTOs/VendorAuthResultDto.cs](ECommerce.Application/DTOs/VendorAuthResultDto.cs) — response DTO for vendor auth tokens.
- [ECommerce.Application/DTOs/ProductImageUploadRequestDto.cs](ECommerce.Application/DTOs/ProductImageUploadRequestDto.cs) — request DTO for image upload.
- [ECommerce.Application/Queries/ProductSearchQuery.cs](ECommerce.Application/Queries/ProductSearchQuery.cs) — query object for product search/filtering.
- [ECommerce.Application/DTOs/PagedResult.cs](ECommerce.Application/DTOs/PagedResult.cs) — generic paged result wrapper.

Design decisions:
- Kept repository method names aligned to the stored-procedure contract in db-architecture.md, even though the implementation uses EF Core LINQ rather than direct stored procedure calls.
- Kept PasswordHash out of the application DTO layer by not introducing any DTOs that expose it.

Assumptions:
- The prompt did not specify whether authentication should return a refresh token, so only a JWT access token was modeled.

### Infrastructure
- [ECommerce.Infrastructure/ECommerceDbContext.cs](ECommerce.Infrastructure/ECommerceDbContext.cs) — EF Core DbContext for Categories, Vendors, Customers, and Products.
- [ECommerce.Infrastructure/Configurations/CategoryConfiguration.cs](ECommerce.Infrastructure/Configurations/CategoryConfiguration.cs) — fluent configuration for Category mapping and the self-referencing category relationship.
- [ECommerce.Infrastructure/Configurations/VendorConfiguration.cs](ECommerce.Infrastructure/Configurations/VendorConfiguration.cs) — fluent configuration for Vendor mapping and the Products relationship.
- [ECommerce.Infrastructure/Configurations/CustomerConfiguration.cs](ECommerce.Infrastructure/Configurations/CustomerConfiguration.cs) — fluent configuration for Customer mapping.
- [ECommerce.Infrastructure/Configurations/ProductConfiguration.cs](ECommerce.Infrastructure/Configurations/ProductConfiguration.cs) — fluent configuration for Product mapping, indexes, and relationships.
- [ECommerce.Infrastructure/Repositories/ProductRepository.cs](ECommerce.Infrastructure/Repositories/ProductRepository.cs) — EF Core repository implementation for product queries, includes customer-facing IsActive filtering, category subtree filtering, search, vendor-specific queries, add/update/delete behavior, and ownership checks.
- [ECommerce.Infrastructure/Repositories/CategoryRepository.cs](ECommerce.Infrastructure/Repositories/CategoryRepository.cs) — EF Core repository implementation for category reads.
- [ECommerce.Infrastructure/Repositories/VendorRepository.cs](ECommerce.Infrastructure/Repositories/VendorRepository.cs) — EF Core repository implementation for vendor lookup and creation.
- [ECommerce.Infrastructure/Repositories/CustomerRepository.cs](ECommerce.Infrastructure/Repositories/CustomerRepository.cs) — EF Core repository implementation for customer lookup and creation.
- [ECommerce.Infrastructure/Services/ProductService.cs](ECommerce.Infrastructure/Services/ProductService.cs) — service implementation for category tree generation, customer-facing product reads, vendor-scoped product reads, create/update/delete/image upload logic.
- [ECommerce.Infrastructure/Services/VendorService.cs](ECommerce.Infrastructure/Services/VendorService.cs) — service implementation for vendor registration/login and JWT creation.

Design decisions:
- Used EF Core LINQ rather than direct stored-procedure calls because the prompt asked for an Infrastructure layer that could be reviewed incrementally and because the repository contract in db-architecture.md was still preserved by keeping the method names and ownership semantics consistent.
- Implemented soft-delete semantics by setting IsActive = false in the repository rather than hard-deleting products.
- Used BCrypt.Net-Next for password hashing in the vendor service.

Assumptions:
- The prompt did not provide a real SQL Server connection string or database migration history, so the infrastructure layer is implemented against EF Core conventions and a local development configuration.

### API
- [ECommerce.API/Program.cs](ECommerce.API/Program.cs) — API startup configuration for controllers, Swagger, EF Core, JWT auth, authorization, CORS, DI registration, and middleware.
- [ECommerce.API/Controllers/ProductsController.cs](ECommerce.API/Controllers/ProductsController.cs) — REST controller for customer-facing product list and detail endpoints.
- [ECommerce.API/Controllers/CategoriesController.cs](ECommerce.API/Controllers/CategoriesController.cs) — REST controller for category listing and category-product endpoints.
- [ECommerce.API/Controllers/AuthController.cs](ECommerce.API/Controllers/AuthController.cs) — REST controller for vendor login and register endpoints.
- [ECommerce.API/Controllers/VendorProductsController.cs](ECommerce.API/Controllers/VendorProductsController.cs) — vendor portal controller for listing, creating, updating, deleting, and image-uploading products, using the JWT claim for VendorId.
- [ECommerce.API/Models/ApiResponse.cs](ECommerce.API/Models/ApiResponse.cs) — generic API response envelope with Success, Data, and Errors.
- [ECommerce.API/Middleware/ExceptionHandlingMiddleware.cs](ECommerce.API/Middleware/ExceptionHandlingMiddleware.cs) — global exception middleware returning a consistent JSON error response.
- [ECommerce.API/Extensions/MiddlewareExtensions.cs](ECommerce.API/Extensions/MiddlewareExtensions.cs) — extension method for registering the exception middleware.

Design decisions:
- Returned a consistent ApiResponse<T> envelope from controllers for both success and error cases.
- Used JWT claims to supply VendorId for vendor write operations rather than reading it from request bodies.

Assumptions:
- The API layer uses the same local development JWT signing settings from appsettings.json; no real secret management or production token issuance flow was added.

## Deviations from db-architecture.md or copilot-backend-prompt.md
None.

## Open items / not yet built
- No EF Core migrations were created yet.
- The prompt asked for a real initial migration; this has not been generated.
- The image upload endpoint is implemented as a DTO-driven update operation, but no actual file upload/storage integration was added.
- No automated tests were created yet.
- No real database-backed seeding or data initialization was added.

## How to resume
The next logical step is to add EF Core migrations and an initial migration for the current model, then validate the API against a running SQL Server instance so the controllers and repositories can be exercised end to end.

## Changelog

### 2026-08-11
- Added the initial Clean Architecture solution structure for the Domain, Application, Infrastructure, and API layers.
- Implemented schema-faithful domain entities for Category, Vendor, Customer, and Product.
- Added repository/service interfaces and DTOs in the Application layer.
- Implemented EF Core DbContext, fluent entity configurations, and repository/service implementations in Infrastructure.
- Added ASP.NET Core API controllers, JWT-based vendor auth flow, and a consistent API response envelope.
