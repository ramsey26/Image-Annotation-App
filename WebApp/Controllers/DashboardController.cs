using AutoMapper;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using WebApp.DTOs;
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
        public const string SessionKeyCanvasData = "CanvasData";
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
            DashboardViewModel dashboardViewModel = new DashboardViewModel();

            userData = (MemberDataModel)Session[SessionKeyUserData];

            if (userData==null)
            {
                userData = await dashboardService.GetUserData();

                foreach (var image in userData.Photos)
                {
                    byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                    string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                    image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.FileName);
                }
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

                if (fileExt != ".jpeg" && fileExt != ".jpg" && fileExt != ".png")
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

                bool isFileUploadedSuccessfully = await dashboardService.UploadPhotoData(photoDataModel);
                if (isFileUploadedSuccessfully)
                {
                    //get last uploaded photo
                    var image = await dashboardService.GetLastPhotoData();

                    //Convert byte array to photo
                    byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                    string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                    image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.FileName);

                    //Update Photo collection with new uploaded photo
                    var userData = (MemberDataModel)Session[SessionKeyUserData];
                    userData.Photos.Add(image);
                   
                     //Update Session data
                     Session[SessionKeyUserData] = userData;

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

        [HttpPost]
        public async Task<ActionResult> GetCanvasImage(int photoId)
        {
            try
            {
                var userData = (MemberDataModel)Session[SessionKeyUserData];
                var photoDataModel = userData.Photos.FirstOrDefault(x => x.Id == photoId);

                // var sessionCanvasBoxes = (List<BoundingBoxDataModel>)Session[SessionKeyCanvasData];

                var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photoId);
                CanvasViewModel canvasViewModel = new CanvasViewModel()
                {
                    PhotoDataModel = photoDataModel,
                    BoundingBoxDataModels = boundingBoxDataModels
                };

                return PartialView("CanvasViewPartial", canvasViewModel);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpPost]
        public async Task<ActionResult> SaveBoundingBoxData(IEnumerable<BoundingBoxDto> boundingBoxDtos, int photoId)
        {
            CanvasViewModel canvasViewModel = new CanvasViewModel();
            try
            {
                var lsBoxData = Mapper.Map<IEnumerable<BoundingBoxDto>, List<BoundingBoxDataModel>>(boundingBoxDtos);

                //Remove all the items where Id is null becuase they are old boxes.
                lsBoxData.RemoveAll(x => x.Id != null);

                bool isSaved = await dashboardService.SaveBoundingBoxData(lsBoxData);

                //If saved, fetch added all the boxes by PhotoId and Update Session data
                if (isSaved)
                {
                   var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photoId);

                    var userData = (MemberDataModel)Session[SessionKeyUserData];
                    var photoDataModel = userData.Photos.FirstOrDefault(x => x.Id == photoId);
                  
                    canvasViewModel.PhotoDataModel = photoDataModel;
                    canvasViewModel.BoundingBoxDataModels = boundingBoxDataModels;

                  //  Session[SessionKeyCanvasData] = boundingBoxDataModels;
                }

                return PartialView("CanvasViewPartial", canvasViewModel);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }
    }
}