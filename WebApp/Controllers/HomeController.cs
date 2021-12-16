using System;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebApp.Helpers;
using WebApp.Models;
using WebApp.Services;

namespace WebApp.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public const string CreateProjectForm = "CreateProjectForm";
        public const string SessionKeyUserProjectData = "UserProjectData";
        public const string JwtBearerToken = "JwtBearerToken";
        public UserSession _userSession = null;
        public const string GeneratedImagesVirtualPath = "~/GeneratedImages/";

        UserProjectService userProjectService;
        DashboardService dashboardService;
        public HomeController()
        {
            _userSession = new UserSession();
            dashboardService = new DashboardService();
            userProjectService = new UserProjectService();
        }

        [HttpPost]
        public async Task<ActionResult> CreateProject(UserProjectViewModel userProjectViewModel)
        {
            MemberDataModel memberData;
            try
            {
                if (!ModelState.IsValid)
                {
                    TempData["errorMessage"] = "Please enter project name";
                    return RedirectToAction("Index");
                }
                var isSuccess = await userProjectService.CreateUserProject(userProjectViewModel);

                if (isSuccess)
                {
                    memberData = await dashboardService.GetUserData();
                    Session[SessionKeyUserProjectData] = memberData;
                    return RedirectToAction("Dashboard", "Dashboard", new { projectName = userProjectViewModel.ProjectName });
                }
                else
                {
                    throw new Exception("Unable to create project");
                }
            }
            catch (HttpException ex)
            {
                TempData["errorMessage"] = ex.Message;
                return RedirectToAction("Index");
            }        
        }

        public async Task<ActionResult> Index()
        {
            ViewBag.Username = _userSession.Username.ToUpper();
            ViewBag.AccessToken = _userSession.BearerToken;

            MemberDataModel memberData;
           
            memberData = (MemberDataModel)Session[SessionKeyUserProjectData];

            if (memberData == null)
            {
                memberData = await dashboardService.GetUserData();
            }
          
            Session[SessionKeyUserProjectData] = memberData;

            var indexViewModel = new IndexViewModel()
            {
                UserProjectDataModels = memberData.UserProjects,
                UserProjectViewModel = new UserProjectViewModel()
            };

            return View(indexViewModel);
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