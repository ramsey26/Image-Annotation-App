using AutoMapper;
using Microsoft.Owin.Security;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebApp.Models;
using WebApp.Services;

namespace WebApp.Controllers
{
    public class AccountController : Controller
    {
        AccountService accountService;
        public const string JwtBearerToken = "JwtBearerToken";
        public AccountController()
        {
            accountService = new AccountService();
        }
      
        // GET: Account
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
       // [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            Session.Remove(JwtBearerToken);
            Request.GetOwinContext().Authentication.SignOut("ApplicationCookie");
            return RedirectToAction("Index", "Home");
        }
        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            LoginViewModel loginViewModel = new LoginViewModel();

            return View(loginViewModel);
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        //[ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(LoginViewModel loginViewModel)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }
            try
            {
                var userDto = await accountService.Login(loginViewModel);
                if (userDto == null) return View();
                Session[JwtBearerToken] = userDto.Token;
            
                AuthenticationProperties options = new AuthenticationProperties();
                options.AllowRefresh = true;
                options.IsPersistent = true;
                options.ExpiresUtc = DateTime.Now.AddDays(3);

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name,userDto.Username),
                    new Claim("AcessToken",string.Format("Bearer {0}",userDto.Token)),
                    new Claim(ClaimTypes.NameIdentifier,userDto.Username),
                    new Claim(ClaimTypes.X500DistinguishedName,"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                };

                var identity = new ClaimsIdentity(claims, "ApplicationCookie");
                Request.GetOwinContext().Authentication.SignIn(options, identity);

                return RedirectToAction("Dashboard", "Home");
            }
            catch(UnauthorizedAccessException ex)
            {
                ViewData["errorMessage"] = ex.Message;
                return View();
            }
        }

        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            RegisterViewModel registerViewModel = new RegisterViewModel();

            return View(registerViewModel);
        }

        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
      //  [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel registerViewModel)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }
            try
            {
                var registerModel = Mapper.Map<RegisterViewModel, RegisterDataModel>(registerViewModel);
                var userDto = await accountService.Register(registerModel);
                Session[JwtBearerToken] = userDto.Token;

                AuthenticationProperties options = new AuthenticationProperties();
                options.AllowRefresh = true;
                options.IsPersistent = true;
                options.ExpiresUtc = DateTime.Now.AddDays(3);

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name,userDto.Username),
                    new Claim("AcessToken",string.Format("Bearer {0}",userDto.Token)),
                    new Claim(ClaimTypes.NameIdentifier,userDto.Username),
                    new Claim(ClaimTypes.X500DistinguishedName,"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                };

                var identity = new ClaimsIdentity(claims, "ApplicationCookie");
                Request.GetOwinContext().Authentication.SignIn(options, identity);

                return RedirectToAction("Dashboard", "Home");
            }
            catch (HttpException ex)
            {
                ViewData["errorMessage"] = ex.Message;
                return View();
            }

        }

    }
}