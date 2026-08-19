namespace ECommerce.API.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public T? Data { get; set; }

    public IReadOnlyList<string> Errors { get; set; } = Array.Empty<string>();
}
