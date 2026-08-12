using AuthService.DTOs;
using AuthService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/admin/manufacturers")]
[Authorize(Roles = "Admin")]
public class AdminManufacturersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminManufacturersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var users = await _userManager.GetUsersInRoleAsync("Manufacturer");

        var dto = users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new ManufacturerUserDto
            {
                Id = u.Id,
                Email = u.Email ?? string.Empty,
                FirstName = u.FirstName ?? string.Empty,
                LastName = u.LastName ?? string.Empty,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToList();

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateManufacturerDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
        {
            return BadRequest(new { Success = false, Message = "User with this email already exists" });
        }

        if (!await _roleManager.RoleExistsAsync("Manufacturer"))
        {
            await _roleManager.CreateAsync(new IdentityRole("Manufacturer"));
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { Success = false, Message = string.Join(", ", result.Errors.Select(e => e.Description)) });
        }

        var addRole = await _userManager.AddToRoleAsync(user, "Manufacturer");
        if (!addRole.Succeeded)
        {
            return BadRequest(new { Success = false, Message = string.Join(", ", addRole.Errors.Select(e => e.Description)) });
        }

        return Ok(new { Success = true, Message = "Manufacturer created" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateManufacturerDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Success = false, Message = "User not found" });

        var isManufacturer = await _userManager.IsInRoleAsync(user, "Manufacturer");
        if (!isManufacturer) return BadRequest(new { Success = false, Message = "User is not a manufacturer" });

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;

        var res = await _userManager.UpdateAsync(user);
        if (!res.Succeeded)
        {
            return BadRequest(new { Success = false, Message = string.Join(", ", res.Errors.Select(e => e.Description)) });
        }

        return Ok(new { Success = true, Message = "Manufacturer updated" });
    }

    [HttpPost("{id}/active")]
    public async Task<IActionResult> SetActive(string id, [FromBody] SetUserActiveDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { Success = false, Message = "User not found" });

        var isManufacturer = await _userManager.IsInRoleAsync(user, "Manufacturer");
        if (!isManufacturer) return BadRequest(new { Success = false, Message = "User is not a manufacturer" });

        user.IsActive = dto.IsActive;
        var res = await _userManager.UpdateAsync(user);
        if (!res.Succeeded)
        {
            return BadRequest(new { Success = false, Message = string.Join(", ", res.Errors.Select(e => e.Description)) });
        }

        return Ok(new { Success = true, Message = dto.IsActive ? "Manufacturer activated" : "Manufacturer deactivated" });
    }
}
