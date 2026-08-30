# Build context must be the "backend" folder, e.g.:
#   docker build -t ecommerce-api -f backend/Dockerfile backend/

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first so restore is cached unless a .csproj actually changes.
COPY ECommerce.Domain/*.csproj ECommerce.Domain/
COPY ECommerce.Application/*.csproj ECommerce.Application/
COPY ECommerce.Infrastructure/*.csproj ECommerce.Infrastructure/
COPY ECommerce.API/*.csproj ECommerce.API/
RUN dotnet restore ECommerce.API/ECommerce.API.csproj

COPY . .
RUN dotnet publish ECommerce.API/ECommerce.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ECommerce.API.dll"]
