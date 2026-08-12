namespace AuthService.Services;

public interface IBusinessApiService
{
    Task<int?> CreateRetailerAsync(CreateRetailerRequest request);
}

public class CreateRetailerRequest
{
    public string ShopName { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? GstNumber { get; set; }
    public string AuthUserId { get; set; } = string.Empty;
}
