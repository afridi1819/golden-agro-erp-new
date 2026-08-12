using System.ComponentModel.DataAnnotations;

namespace AuthService.Models;

public class ApprovalRequest
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationUser? User { get; set; }

    [Required]
    [MaxLength(50)]
    public string RequestedRole { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Expired

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(1);

    public DateTime? DecidedAt { get; set; }

    public string? DecidedByUserId { get; set; }

    [MaxLength(500)]
    public string? DecisionNote { get; set; }

    // Retailer request fields
    [MaxLength(200)]
    public string? ShopName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [MaxLength(50)]
    public string? GstNumber { get; set; }
}
