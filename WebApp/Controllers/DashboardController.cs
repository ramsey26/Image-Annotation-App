using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebApp.Helpers;
using WebApp.Models;
using WebApp.Services;

namespace WebApp.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        public const string DashboardForm = "DashboardForm";
        public const string UploadFileForm = "UploadFileForm";
        public UserSession _userSession = null;
        UserService userService;
        public DashboardController()
        {
            _userSession = new UserSession();
            userService = new UserService();
        }

        public async Task<ActionResult> Dashboard()
        {
            MemberDataModel userData;
            DashboardViewModel dashboardViewModel;

            userData = await userService.GetUserData();

            ViewBag.Username = _userSession.Username.ToUpper();
            ViewBag.AccessToken = _userSession.BearerToken;

            dashboardViewModel = new DashboardViewModel();
            dashboardViewModel.MemberDataModel = userData;
            return View(dashboardViewModel);
        }

        [HttpPost]
        public ActionResult UploadFile()
        {
            HttpPostedFileBase uploadedFile;
            try
            {
                if (Request.Files.Count == 0)
                {
                    TempData["errorMessage"] = "Please choose a file.";
                    return Json("Please choose a file.");
                }

                uploadedFile = Request.Files[0];

                string fileExt = Path.GetExtension(uploadedFile.FileName);

                if (fileExt != ".jpeg" && fileExt != ".jpg" && fileExt!=".png")
                {
                    TempData["errorMessage"] = "Please choose an image file.";
                    return Json("Please choose an image file.");
                }

                string path = Path.Combine(Server.MapPath("~/UploadedFiles/"), Path.GetFileName(uploadedFile.FileName));
                uploadedFile.SaveAs(path);

                TempData["successMessage"] = "File uploaded successfully.";
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = "Error while uploading file.";
                return Json(ex.Message);
            }

            // return RedirectToAction("Dashboard", "Dashboard");
            return Json("File uploaded Successfully.");
        }
    }
}