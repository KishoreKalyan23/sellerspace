using System.Collections.Generic;

namespace ECommerce.Domain.Entities;

public class Category
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public int? ParentCategoryId { get; set; }

    public Category? Parent { get; set; }

    public ICollection<Category> Children { get; set; } = new List<Category>();

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
