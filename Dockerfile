
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ECommerce.sln ./
COPY backend/ECommerce.API/ECommerce.API.csproj backend/ECommerce.API/
COPY backend/ECommerce.Application/ECommerce.Application.csproj backend/ECommerce.Application/
COPY backend/ECommerce.Domain/ECommerce.Domain.csproj backend/ECommerce.Domain/
COPY backend/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj backend/ECommerce.Infrastructure/

# Restore dependencies
RUN dotnet restore ECommerce.sln

# Copy remaining source code
COPY backend/ backend/

# Publish API
RUN dotnet publish backend/ECommerce.API/ECommerce.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Render's default web service port
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "ECommerce.API.dll"]
