using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApprovalsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IBusinessApiService _businessApiService;

    public ApprovalsController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IBusinessApiService businessApiService)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _businessApiService = businessApiService;
    }

    [Authorize(Roles = "Admin,Manufacturer")]
    [HttpGet]
    public async Task<IActionResult> GetPending()
    {
        var now = DateTime.UtcNow;

        var q = _context.ApprovalRequests
            .Include(r => r.User)
            .Where(r => r.Status == "Pending")
            .OrderByDescending(r => r.RequestedAt)
            .AsQueryable();

        // Manufacturers can only review retailer requests
        if (!User.IsInRole("Admin"))
        {
            q = q.Where(r => r.RequestedRole == "Retailer");
        }

        var requests = await q.ToListAsync();

        // Mark expired
        var expired = false;
        foreach (var r in requests)
        {
            if (r.ExpiresAt <= now)
            {
                r.Status = "Expired";
                r.DecidedAt = now;
                r.DecisionNote = "Auto-expired (not reviewed within 24 hours)";
                expired = true;
            }
        }
        if (expired)
        {
            await _context.SaveChangesAsync();
            // filter out newly-expired from the "pending" list
            requests = requests.Where(r => r.Status == "Pending").ToList();
        }

        var dto = requests.Select(r => new ApprovalRequestDto
        {
            Id = r.Id,
            UserId = r.UserId,
            Email = r.User?.Email ?? string.Empty,
            FirstName = r.User?.FirstName ?? string.Empty,
            LastName = r.User?.LastName ?? string.Empty,
            RequestedRole = r.RequestedRole,
            Status = r.Status,
            RequestedAt = r.RequestedAt,
            ExpiresAt = r.ExpiresAt,
            ShopName = r.ShopName,
            Phone = r.Phone,
            Address = r.Address,
            GstNumber = r.GstNumber,
        }).ToList();

        return Ok(dto);
    }

    [Authorize(Roles = "Admin,Manufacturer")]
    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] ApprovalDecisionDto? body)
    {
        var now = DateTime.UtcNow;
        var req = await _context.ApprovalRequests
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound(new { Success = false, Message = "Approval request not found" });
        if (req.Status != "Pending") return BadRequest(new { Success = false, Message = $"Request is not pending (status={req.Status})" });

        if (req.ExpiresAt <= now)
        {
            req.Status = "Expired";
            req.DecidedAt = now;
            req.DecisionNote = "Auto-expired (not reviewed within 24 hours)";
            await _context.SaveChangesAsync();
            return BadRequest(new { Success = false, Message = "Request expired" });
        }

        // Authorization rules
        if (req.RequestedRole == "Manufacturer" && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        if (req.RequestedRole != "Manufacturer" && req.RequestedRole != "Retailer")
        {
            return BadRequest(new { Success = false, Message = "Unsupported requested role" });
        }

        var user = req.User;
        if (user == null) return BadRequest(new { Success = false, Message = "User not found for request" });

        // Ensure role exists
        if (!await _roleManager.RoleExistsAsync(req.RequestedRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(req.RequestedRole));
        }

        // Activate and assign role
        user.IsActive = true;
        await _userManager.UpdateAsync(user);

        var addRoleResult = await _userManager.AddToRoleAsync(user, req.RequestedRole);
        if (!addRoleResult.Succeeded)
        {
            return BadRequest(new { Success = false, Message = string.Join(", ", addRoleResult.Errors.Select(e => e.Description)) });
        }

        // If retailer, create in business DB now (only after approval)
        if (req.RequestedRole == "Retailer" && !string.IsNullOrWhiteSpace(req.ShopName))
        {
            var retailerId = await _businessApiService.CreateRetailerAsync(new CreateRetailerRequest
            {
                ShopName = req.ShopName,
                OwnerName = $"{user.FirstName} {user.LastName}".Trim(),
                OwnerNumber = req.Phone ?? "",
                Email = user.Email ?? "",
                Address = req.Address ?? "",
                GstNumber = req.GstNumber,
                AuthUserId = user.Id
            });

            if (retailerId.HasValue)
            {
                user.RetailerId = retailerId.Value;
                await _userManager.UpdateAsync(user);
            }
        }

        req.Status = "Approved";
        req.DecidedAt = now;
        req.DecidedByUserId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
        req.DecisionNote = body?.Note;

        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Request approved" });
    }

    [Authorize(Roles = "Admin,Manufacturer")]
    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, [FromBody] ApprovalDecisionDto? body)
    {
        var now = DateTime.UtcNow;
        var req = await _context.ApprovalRequests
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound(new { Success = false, Message = "Approval request not found" });
        if (req.Status != "Pending") return BadRequest(new { Success = false, Message = $"Request is not pending (status={req.Status})" });

        if (req.ExpiresAt <= now)
        {
            req.Status = "Expired";
            req.DecidedAt = now;
            req.DecisionNote = "Auto-expired (not reviewed within 24 hours)";
            await _context.SaveChangesAsync();
            return BadRequest(new { Success = false, Message = "Request expired" });
        }

        // Authorization rules
        if (req.RequestedRole == "Manufacturer" && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // Deactivate user (soft-reject)
        if (req.User != null)
        {
            req.User.IsActive = false;
            await _userManager.UpdateAsync(req.User);
        }

        req.Status = "Rejected";
        req.DecidedAt = now;
        req.DecidedByUserId = User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
        req.DecisionNote = body?.Note;

        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "Request rejected" });
    }
}
