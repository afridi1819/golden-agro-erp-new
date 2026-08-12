using Microsoft.AspNetCore.Identity;

namespace AuthService.Models;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? RetailerId { get; set; }  // Link to Business DB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}