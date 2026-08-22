namespace ECommerce.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }

    public IReadOnlyList<CategoryDto> Children { get; set; } = Array.Empty<CategoryDto>();
}

public class CreateCategoryRequestDto
{
    public string Name { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }
}

public class UpdateCategoryRequestDto
{
    public string Name { get; set; } = string.Empty;

    public int? ParentCategoryId { get; set; }
}
