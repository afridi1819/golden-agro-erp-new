using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITokenService _tokenService;
        private readonly IBusinessApiService _businessApiService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ITokenService tokenService,
            IBusinessApiService businessApiService,
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _tokenService = tokenService;
            _businessApiService = businessApiService;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            // Check if user exists
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "User with this email already exists"
                });
            }

            // Registration is a REQUEST.
            // We only accept Manufacturer/Retailer as requested roles from the public endpoint.
            var validRequestedRoles = new[] { "Manufacturer", "Retailer" };
            if (!validRequestedRoles.Contains(model.Role))
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid role request. Must be Manufacturer or Retailer"
                });
            }

            if (model.Role == "Retailer" && string.IsNullOrWhiteSpace(model.ShopName))
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "ShopName is required for Retailer registration"
                });
            }

            // Bootstrap rule: first Manufacturer becomes Admin (active immediately)
            var existingAdmins = await _userManager.GetUsersInRoleAsync("Admin");
            var isBootstrapAdmin = model.Role == "Manufacturer" && existingAdmins.Count == 0;

            // Create user (inactive by default until approved)
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                IsActive = isBootstrapAdmin
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                });
            }

            // Ensure requested role exists (for later approval)
            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(model.Role));
            }

            if (isBootstrapAdmin)
            {
                // Ensure Admin role exists and assign it.
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("Admin"));
                }
                await _userManager.AddToRoleAsync(user, "Admin");

                // Record as auto-approved
                _context.ApprovalRequests.Add(new ApprovalRequest
                {
                    UserId = user.Id,
                    RequestedRole = model.Role,
                    Status = "Approved",
                    RequestedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow,
                    DecidedAt = DateTime.UtcNow,
                    DecidedByUserId = user.Id,
                    DecisionNote = "Bootstrap: first manufacturer became admin",
                    ShopName = model.ShopName,
                    Phone = model.Phone,
                    Address = model.Address,
                    GstNumber = model.GstNumber
                });

                // Generate tokens (bootstrap admin is immediately active)
                var token = _tokenService.GenerateAccessToken(user, "Admin");
                var refreshToken = _tokenService.GenerateRefreshToken();

                _context.RefreshTokens.Add(new RefreshToken
                {
                    Token = refreshToken,
                    UserId = user.Id,
                    ExpiryDate = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!))
                });

                await _context.SaveChangesAsync();

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Admin account created",
                    Token = token,
                    RefreshToken = refreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        FirstName = user.FirstName ?? "",
                        LastName = user.LastName ?? "",
                        Role = "Admin",
                        RetailerId = user.RetailerId
                    }
                });
            }

            // Create approval request (pending for 24 hours)
            _context.ApprovalRequests.Add(new ApprovalRequest
            {
                UserId = user.Id,
                RequestedRole = model.Role,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(1),
                ShopName = model.ShopName,
                Phone = model.Phone,
                Address = model.Address,
                GstNumber = model.GstNumber
            });

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Registration request submitted. Please wait for approval within 24 hours."
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            if (!user.IsActive)
            {
                var now = DateTime.UtcNow;
                var hasPending = await _context.ApprovalRequests.AnyAsync(r =>
                    r.UserId == user.Id &&
                    r.Status == "Pending" &&
                    r.ExpiresAt > now);

                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = hasPending ? "Account pending approval" : "Account is deactivated"
                });
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var token = _tokenService.GenerateAccessToken(user, role);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // Revoke old refresh tokens and save new one
            var oldTokens = await _context.RefreshTokens
                .Where(t => t.UserId == user.Id && !t.IsRevoked)
                .ToListAsync();

            foreach (var oldToken in oldTokens)
            {
                oldToken.IsRevoked = true;
            }

            _context.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!))
            });

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName ?? "",
                    LastName = user.LastName ?? "",
                    Role = role,
                    RetailerId = user.RetailerId
                }
            });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto model)
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(model.Token);
            if (principal == null)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid token"
                });
            }

            var userId = principal.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid token"
                });
            }

            var storedToken = await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == model.RefreshToken && t.UserId == userId);

            if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiryDate < DateTime.UtcNow)
            {
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid or expired refresh token"
                });
            }

            var user = storedToken.User;
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var newToken = _tokenService.GenerateAccessToken(user, role);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Revoke old and save new
            storedToken.IsRevoked = true;
            _context.RefreshTokens.Add(new RefreshToken
            {
                Token = newRefreshToken,
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!))
            });

            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Token refreshed successfully",
                Token = newToken,
                RefreshToken = newRefreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["Jwt:ExpiryMinutes"]!))
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                var tokens = await _context.RefreshTokens
                    .Where(t => t.UserId == userId && !t.IsRevoked)
                    .ToListAsync();

                foreach (var token in tokens)
                {
                    token.IsRevoked = true;
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new { Success = true, Message = "Logged out successfully" });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
            var user = await _userManager.FindByIdAsync(userId!);

            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                });
            }

            return Ok(new { Success = true, Message = "Password changed successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
            var user = await _userManager.FindByIdAsync(userId!);

            if (user == null)
            {
                return NotFound(new { Success = false, Message = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName ?? "",
                LastName = user.LastName ?? "",
                Role = roles.FirstOrDefault() ?? "User",
                RetailerId = user.RetailerId
            });
        }
    }
}