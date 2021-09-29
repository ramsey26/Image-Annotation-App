using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using WebApp.Models;
using WebApp.Utilities;

namespace WebApp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public const string JwtBearerToken = "JwtBearerToken";
        public UserSession _userSession = null;

        //public HomeController(IUserSession userSession)
        //{
        //    _userSession = userSession;
        //}

        public HomeController()
        {
            _userSession = new UserSession();
        }

        public ActionResult Index()
        {
            ViewBag.Username = _userSession.Username.ToUpper();
            ViewBag.AccessToken = _userSession.BearerToken;

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }
      
        public ActionResult Dashboard()
        {
            //string token = Session[JwtBearerToken] != null ? Session[JwtBearerToken].ToString() : null;
            //if (token == null)
            //{
            //    return RedirectToAction("Login", "Account");
            //}
            ViewBag.Username = _userSession.Username.ToUpper();
            ViewBag.AccessToken = _userSession.BearerToken;

            return View();
        }
        
        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
      
    }

    public interface IUserSession
    {
        string Username { get; }
        string BearerToken { get; }
    }

    public class UserSession : IUserSession
    {

        public string Username
        {
            get { return ((ClaimsPrincipal)HttpContext.Current.User).FindFirst(ClaimTypes.Name).Value; }
        }

        public string BearerToken
        {
            get { return ((ClaimsPrincipal)HttpContext.Current.User).FindFirst("AcessToken").Value; }
        }

    }
}