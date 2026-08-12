namespace AuthService.DTOs;

public class ApprovalRequestDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public string RequestedRole { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    // Retailer
    public string? ShopName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? GstNumber { get; set; }
}

public class ApprovalDecisionDto
{
    public string? Note { get; set; }
}
