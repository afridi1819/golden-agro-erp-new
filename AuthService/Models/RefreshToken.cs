namespace AuthService.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key
        public string UserId { get; set; } = string.Empty;
        public virtual ApplicationUser User { get; set; } = null!;
    }
}