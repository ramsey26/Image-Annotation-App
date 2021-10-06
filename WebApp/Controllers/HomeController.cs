using System.Threading.Tasks;
using System.Web.Mvc;
using WebApp.Helpers;
using WebApp.Models;
using WebApp.Services;

namespace WebApp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public const string JwtBearerToken = "JwtBearerToken";
        public UserSession _userSession = null;
       

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
      
        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
      
    }
}