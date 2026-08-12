using AuthService.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // RefreshToken configuration
        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ApprovalRequest configuration
        builder.Entity<ApprovalRequest>(entity =>
        {
            entity.ToTable("ApprovalRequests");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.RequestedRole).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.DecisionNote).HasMaxLength(500);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Rename Identity tables (optional)
        builder.Entity<ApplicationUser>().ToTable("Users");
    }
}
