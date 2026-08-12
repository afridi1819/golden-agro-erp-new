using System.Text;
using System.Text.Json;

namespace AuthService.Services;

public class BusinessApiService : IBusinessApiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BusinessApiService> _logger;

    public BusinessApiService(HttpClient httpClient, IConfiguration configuration, ILogger<BusinessApiService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<int?> CreateRetailerAsync(CreateRetailerRequest request)
    {
        try
        {
            var baseUrl = _configuration["SpringBootApi:BaseUrl"];
            var json = JsonSerializer.Serialize(new
            {
                shopName = request.ShopName,
                ownerName = request.OwnerName,
                phone = request.OwnerNumber,
                email = request.Email,
                address = request.Address,
                gstNumber = request.GstNumber,
                authUserId = request.AuthUserId,
                status = "active"
            });

            _logger.LogInformation("Creating retailer in business API: {Json}", json);

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{baseUrl}/retailers", content);

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Business API response: {StatusCode} - {Content}", response.StatusCode, responseContent);

            if (response.IsSuccessStatusCode)
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<ApiResponse<RetailerData>>(responseContent, options);
                if (result?.Success == true && result.Data != null)
                {
                    _logger.LogInformation("Retailer created with ID: {RetailerId}", result.Data.RetailerId);
                    return result.Data.RetailerId;
                }
                _logger.LogWarning("Business API returned success=false or null data: {Message}", result?.Message);
            }

            _logger.LogError("Failed to create retailer in business API: {StatusCode}", response.StatusCode);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling business API");
            return null;
        }
    }

    // Response wrapper matching Spring Boot's ApiResponse<T>
    private class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

    private class RetailerData
    {
        public int RetailerId { get; set; }
    }
}
