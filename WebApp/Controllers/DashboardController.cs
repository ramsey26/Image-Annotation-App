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
   // [RoutePrefix("Dashboard")]
    public class DashboardController : Controller
    {
        public const string DashboardForm = "DashboardForm";
        public const string UploadFileForm = "UploadFileForm";
        public const string SessionKeyCanvasData = "CanvasData";
        public const string GeneratedImagesVirtualPath = "~/GeneratedImages/";
        public const string SessionProjectKey = "ProjectKey";

        public UserSession _userSession = null;
        DashboardService dashboardService;
        UserProjectService userProjectService;
        public DashboardController()
        {
            _userSession = new UserSession();
            dashboardService = new DashboardService();
            userProjectService = new UserProjectService();
        }

        [ActionName("Dashboard")]
        [Route("Dashboard/{projectName}")]
        public async Task<ActionResult> Dashboard(string projectName)
        {
            Session[SessionProjectKey] = projectName;

            UserProjectsWithPhotosDto userProjectsWithPhotosDto;

            DashboardViewModel dashboardViewModel = new DashboardViewModel();

            userProjectsWithPhotosDto = (UserProjectsWithPhotosDto)Session[projectName];

            if (userProjectsWithPhotosDto == null)
            {
                userProjectsWithPhotosDto = await userProjectService.GetUserProjectByNameAsync(projectName);
              
                if (userProjectsWithPhotosDto !=null)
                {
                    foreach (var image in userProjectsWithPhotosDto.Photos)
                    {
                        byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                        string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                        image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.FileName);
                    }
                }
            }

            dashboardViewModel.UserProjectWithPhotosDto = userProjectsWithPhotosDto;

            Session[projectName] = userProjectsWithPhotosDto;

            return View(dashboardViewModel);
        }

        [ActionName("UploadFile")]
        [Route("UploadFile")]
        public async Task<ActionResult> UploadFile()
        {
            HttpPostedFileBase uploadedFile;
            List<PhotoDataModel> photoDataModels = new List<PhotoDataModel>();
            try
            {
                if (Request.Files.Count == 0)
                {
                    return Json("Please choose a Photo.");
                }

                uploadedFile = Request.Files[0];

                string fileExt = Path.GetExtension(uploadedFile.FileName);

                if (fileExt != ".jpeg" && fileExt != ".jpg" && fileExt != ".png")
                {
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
                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

                bool isFileUploadedSuccessfully = await dashboardService.UploadPhotoData(photoDataModel, dashboardData.Id);
                if (isFileUploadedSuccessfully)
                {
                    //get last uploaded photo
                    var image = await dashboardService.GetLastPhotoData(dashboardData.Id);

                    //Convert byte array to photo
                    byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                    string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                    image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.FileName);

                    //Update Photo collection with new uploaded photo
                    dashboardData.Photos.Add(image);

                    photoDataModels = dashboardData.Photos;
                    //Update Session data
                    Session[sessionProjectName] = dashboardData;
                }
            }
            catch (Exception ex)
            {
                return Json(ex.Message);
            }

            return PartialView("GridViewPartial", photoDataModels);
            // return Json("Photo uploaded Successfully.");
        }

        [ActionName("GetCanvasImage")]
        [Route("GetCanvasImage")]
        public async Task<ActionResult> GetCanvasImage(int photoId)
        {
            try
            {
                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];
                var photoDataModel = dashboardData.Photos.FirstOrDefault(x => x.Id == photoId);

                // var sessionCanvasBoxes = (List<BoundingBoxDataModel>)Session[SessionKeyCanvasData];

                var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photoId);
                var polygonDataModels = await dashboardService.GetPolygonsByPhotoId(photoId);

                CanvasViewModel canvasViewModel = new CanvasViewModel()
                {
                    PhotoDataModel = photoDataModel,
                    BoundingBoxDataModels = boundingBoxDataModels,
                    PolygonDataModels = polygonDataModels
                };

                return PartialView("CanvasViewPartial", canvasViewModel);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [ActionName("SaveBoundingBoxData")]
        [Route("SaveBoundingBoxData")]
        public async Task<ActionResult> SaveBoundingBoxData(List<BoundingBoxDto> boundingBoxDtos, int photoId)
        {
            CanvasViewModel canvasViewModel = new CanvasViewModel();
            try
            {
                var lsBoxData = Mapper.Map<IEnumerable<BoundingBoxDto>, List<BoundingBoxDataModel>>(boundingBoxDtos);

                //Remove all those boxes where action is null becuase there is no action performed against that box.
                lsBoxData.RemoveAll(x => x.Action == null);

                bool isSaved = await dashboardService.SaveBoundingBoxData(lsBoxData);

                //If saved, fetch added all the boxes by PhotoId and Update Session data
                if (isSaved)
                {
                    var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photoId);
                    var polygonDataModels = await dashboardService.GetPolygonsByPhotoId(photoId);

                    string sessionProjectName = (string)Session[SessionProjectKey];
                    var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];
                    var photoDataModel = dashboardData.Photos.FirstOrDefault(x => x.Id == photoId);

                    canvasViewModel.PhotoDataModel = photoDataModel;
                    canvasViewModel.BoundingBoxDataModels = boundingBoxDataModels;
                    canvasViewModel.PolygonDataModels = polygonDataModels;

                    //  Session[SessionKeyCanvasData] = boundingBoxDataModels;
                }

                return PartialView("CanvasViewPartial", canvasViewModel);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
       
        [ActionName("SavePolygonData")]
        [Route("SavePolygonData")]
        public async Task<ActionResult> SavePolygonData(List<PolygonDataModel> polygonData, int photoId)
        {
            CanvasViewModel canvasViewModel = new CanvasViewModel();
            try
            {
                polygonData.RemoveAll(x => x.Action == null);

                bool isSaved = await dashboardService.SavePolygonData(polygonData);

                var polygonDataModels = await dashboardService.GetPolygonsByPhotoId(photoId);
                var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photoId);

                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];
                var photoDataModel = dashboardData.Photos.FirstOrDefault(x => x.Id == photoId);

                canvasViewModel.PhotoDataModel = photoDataModel;
                canvasViewModel.BoundingBoxDataModels = boundingBoxDataModels;
                canvasViewModel.PolygonDataModels = polygonDataModels;

                return PartialView("CanvasViewPartial", canvasViewModel);

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [ActionName("GetGridViewData")]
        [Route("GetGridViewData")]
        public ActionResult GetGridViewData()
        {
            try
            {
                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

                List<PhotoDataModel> photoDataModel = new List<PhotoDataModel>();

                if (dashboardData.Photos.Count != 0)
                {
                    photoDataModel = dashboardData.Photos.ToList();
                }
                return PartialView("GridViewPartial", photoDataModel);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}