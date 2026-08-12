using AuthService.Models;
using System.Security.Claims;

namespace AuthService.Services;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, string role);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}