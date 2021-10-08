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
        public const string SessionKeyUserData = "UserDashboardData";
        public const string GeneratedImagesVirtualPath = "~/GeneratedImages/";

        public UserSession _userSession = null;
        DashboardService dashboardService;
        public DashboardController()
        {
            _userSession = new UserSession();
            dashboardService = new DashboardService();
        }

        public async Task<ActionResult> Dashboard()
        {
            MemberDataModel userData;
            DashboardViewModel dashboardViewModel;

            userData = await dashboardService.GetUserData();

            dashboardViewModel = new DashboardViewModel();
           
            foreach(var image in userData.Photos)
            {
                byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.FileName);
            }

            dashboardViewModel.MemberDataModel = userData;

            Session[SessionKeyUserData] = userData;

            return View(dashboardViewModel);
        }

        [HttpPost]
        public async Task<ActionResult> UploadFile()
        {
            HttpPostedFileBase uploadedFile;
          
            try
            {
                if (Request.Files.Count == 0)
                {
                    TempData["errorMessage"] = "Please choose a Photo.";
                    return Json("Please choose a Photo.");
                }

                uploadedFile = Request.Files[0];

                string fileExt = Path.GetExtension(uploadedFile.FileName);

                if (fileExt != ".jpeg" && fileExt != ".jpg" && fileExt!=".png")
                {
                    TempData["errorMessage"] = "Please choose a photo.";
                    return Json("Please choose an image file.");
                }

                // Converting to bytes.  
                byte[] fileToSave = new byte[uploadedFile.InputStream.Length];
                uploadedFile.InputStream.Read(fileToSave, 0, fileToSave.Length);

                PhotoDataModel photoDataModel = new PhotoDataModel
                {
                    FileName = uploadedFile.FileName,
                    FileContent = Convert.ToBase64String(fileToSave),
                    FileContentType = uploadedFile.ContentType
                };

                var isSuccess = await dashboardService.UploadPhotoData(photoDataModel);
                if (isSuccess)
                {
                    TempData["successMessage"] = "Photo uploaded successfully.";
                }
            }
            catch (Exception ex)
            {
                TempData["errorMessage"] = "Error while uploading file.";
                return Json(ex.Message);
            }

            return Json("Photo uploaded Successfully.");
        }

        /// <summary>  
        /// GET: /Dashboard/DownloadFile  
        /// </summary>  
        /// <param name="fileId">File Id parameter</param>  
        /// <returns>Return download file</returns>  
        public ActionResult DownloadFile(int fileId)
        {
            var userData = (MemberDataModel)Session[SessionKeyUserData];

            var fileInfo = userData.Photos.FirstOrDefault(x => x.Id == fileId);

            return this.GetFile(fileInfo.FileContent, fileInfo.FileContentType);
        }

        [HttpPost]
        public ActionResult GenerateImgFile(int fileId)
        {
            var userData = (MemberDataModel)Session[SessionKeyUserData];

            var photoDataModel = userData.Photos.FirstOrDefault(x => x.Id == fileId);

            return PartialView("CanvasViewPartial", photoDataModel);
        }

        /// <summary>  
        /// Get file method.  
        /// </summary>  
        /// <param name="fileContent">File content parameter.</param>  
        /// <param name="fileContentType">File content type parameter</param>  
        /// <returns>Returns - File.</returns>  
        private FileResult GetFile(string fileContent, string fileContentType)
        {
            // Initialization.  
            FileResult file;

            try
            {
                // Get file.  
                byte[] byteContent = Convert.FromBase64String(fileContent);
                file = this.File(byteContent, fileContentType);
            }
            catch (Exception ex)
            {
                // Info.  
                throw ex;
            }

            // info.  
            return file;
        }
    }
}