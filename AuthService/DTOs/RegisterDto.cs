using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;  // Admin, Retailer

    // Retailer specific fields
    public string? ShopName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? GstNumber { get; set; }
}