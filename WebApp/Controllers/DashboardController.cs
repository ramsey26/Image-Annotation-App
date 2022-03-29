using AutoMapper;
using System;
using System.Collections.Generic;
using System.Data;
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
        public const string GeneratedXMLVirtualPath = "~/GeneratedXML/";
        public const string SessionProjectKey = "ProjectKey";
        public const string SessionLablesKey = "LabelKey";

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

                if (userProjectsWithPhotosDto != null)
                {
                    foreach (var image in userProjectsWithPhotosDto.Photos)
                    {
                        byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                        string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                        image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.Id);
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
            int photoId = -1;
            HttpPostedFileBase uploadedFile;
            List<PhotoDataModel> photoDataModels = new List<PhotoDataModel>();
            SavedData uploadFileResponse = null;

            try
            {
                if (Request.Files.Count == 0)
                {
                    return Json("Please choose a Photo.");
                }

                uploadedFile = Request.Files[0];

                string newFileName = uploadedFile.FileName;

                var fileNameArr = uploadedFile.FileName.Split('/');

                if (fileNameArr.Length > 1)
                {
                    newFileName = fileNameArr[1];
                }
            
                //Check filename if already exists in session then fetch it else upload it 
                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];
                var existingPhotoDataModel = dashboardData.Photos.Find(x => x.FileName == newFileName);
                
                if (existingPhotoDataModel != null)
                {
                    uploadFileResponse = new SavedData()
                    {
                        Id = existingPhotoDataModel.Id,
                        IsSaved = false
                    };
                    return Json(uploadFileResponse);
                }
               
                string fileExt = Path.GetExtension(uploadedFile.FileName);

                if (fileExt != ".jpeg" && fileExt != ".jpg" && fileExt != ".png")
                {
                    uploadFileResponse = new SavedData()
                    {
                        Id = -1,
                        IsSaved = false
                    };
                    return Json(uploadFileResponse);
                }

                // Converting to bytes.  
                byte[] fileToSave = new byte[uploadedFile.InputStream.Length];
                uploadedFile.InputStream.Read(fileToSave, 0, fileToSave.Length);

                PhotoDataModel photoDataModel = new PhotoDataModel
                {
                    FileName = newFileName,//uploadedFile.FileName,
                    FileContent = Convert.ToBase64String(fileToSave),
                    FileContentType = uploadedFile.ContentType
                };

                //string sessionProjectName = (string)Session[SessionProjectKey];
                //var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

                bool isFileUploadedSuccessfully = await dashboardService.UploadPhotoData(photoDataModel, dashboardData.Id);
                if (isFileUploadedSuccessfully)
                {
                    //get last uploaded photo
                    var image = await dashboardService.GetLastPhotoData(dashboardData.Id);
                    photoId = image.Id;

                    //Convert byte array to photo
                    byte[] imageToWrite = Convert.FromBase64String(image.FileContent);
                    string strtest = Server.MapPath(GeneratedImagesVirtualPath);

                    image.ImageVirtualPath = imageToWrite.WriteImageFile(strtest, GeneratedImagesVirtualPath, image.Id);

                    //Update Photo collection with new uploaded photo
                    dashboardData.Photos.Add(image);

                    photoDataModels = dashboardData.Photos;
                    //Update Session data
                    Session[sessionProjectName] = dashboardData;
                }
            }
            catch (Exception ex)
            {
                // return Json(ex.Message);
                throw new Exception(ex.Message);
            }

            //return PartialView("GridViewPartial", photoDataModels);
            uploadFileResponse = new SavedData()
            {
                Id = photoId,
                IsSaved = true
            };
            return Json(uploadFileResponse);
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

        [ActionName("GetAddLablesPartial")]
        [Route("GetAddLablesPartial")]
        public ActionResult GetAddLablesPartial(string labelId)
        {
            try
            {
                TempData["uid"] = labelId;
                return PartialView("AddLabelsParital");
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [ActionName("SaveLabelData")]
        [Route("SaveLabelData")]
        public async Task<ActionResult> SaveLabelData(LabelsDataModel labelDataModel)
        {
            SavedData resp;

            string sessionProjectName = (string)Session[SessionProjectKey];
            var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

            try
            {
                //Logic to call API service and save label to db
          
                if (dashboardData.Labels == null)
                {
                    dashboardData.Labels = new List<LabelsDataModel>();
                }
                //Add Label
                if (labelDataModel.Id == 0)
                {
                    if (dashboardData.Labels.Find(x => x.LabelName == labelDataModel.LabelName) == null)
                    {
                        //var label = new LabelsDataModel()
                        //{
                        //    Id = listLabels.Count + 1,
                        //    LabelName = labelDataModel.LabelName
                        //};
                        bool isSuccess = await dashboardService.AddLabelsData(labelDataModel);
                        if (isSuccess)
                        {
                            dashboardData.Labels = await dashboardService.GetLabelsByUserProjectId(labelDataModel.UserProjectId);
                            Session[sessionProjectName] = dashboardData;
                        }
                        
                        //After saving changes get Id of saved label
                        resp = new SavedData()
                        {
                            Id = dashboardData.Labels.Find(x => x.LabelName == labelDataModel.LabelName).Id,
                            IsSaved = true
                        };
                        return Json(resp);
                    }
                }
                //Edit Label
                else if (labelDataModel.Id > 0)
                {
                    if (dashboardData.Labels.Find(x => x.LabelName == labelDataModel.LabelName) == null)
                    {
                        var editLabel = dashboardData.Labels.FirstOrDefault(x => x.Id == labelDataModel.Id);
                        editLabel.LabelName = labelDataModel.LabelName;
                        //Edit
                        bool isSuccess = await dashboardService.UpdateLabelsData(editLabel);
                        if (isSuccess)
                        {
                           
                            dashboardData.Labels = await dashboardService.GetLabelsByUserProjectId(labelDataModel.UserProjectId);
                            Session[sessionProjectName] = dashboardData;
                        }

                        //After saving changes get Id of saved label
                        resp = new SavedData()
                        {
                            Id = labelDataModel.Id,
                            IsSaved = true
                        };
                        return Json(resp);
                    }
                }
                resp = new SavedData()
                {
                    Id = -1,
                    IsSaved = false
                };
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
    
            return Json(resp);
        }

        [ActionName("DeleteLabelData")]
        [Route("DeleteLabelData")]
        public async Task<ActionResult> DeleteLabelData(int labelId)
        {
            string sessionProjectName = (string)Session[SessionProjectKey];
            var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

            var label = dashboardData.Labels.FirstOrDefault(x => x.Id == labelId);

            //Delete
            bool isSuccess = await dashboardService.DeleteLabelsData(label);
            if (isSuccess)
            {
                dashboardData.Labels = await dashboardService.GetLabelsByUserProjectId(label.UserProjectId);
                Session[sessionProjectName] = dashboardData;
            }

            SavedData savedData = new SavedData()
            {
                Id = -1,
                IsSaved = true
            };

            return Json(savedData);
        }

        [ActionName("GenerateXmlData")]
        [Route("GenerateXmlData")]
        public async Task<ActionResult> GenerateXmlData(bool xmlFlag)
        {
            try
            {
                SavedData savedData = null;
                string sessionProjectName = (string)Session[SessionProjectKey];
                var dashboardData = (UserProjectsWithPhotosDto)Session[sessionProjectName];

                //First set isCompleted flag to true in UserProject table then generate xml files 
                bool isSuccess = await userProjectService.UpdateUserProject(dashboardData.Id); //id is userproject id 

                if (isSuccess)
                {
                    dashboardData.IsCompleted = dashboardData.IsCompleted != true;
                    Session[sessionProjectName] = dashboardData;

                    savedData = new SavedData()
                    {
                        Id = 1,
                        IsSaved = true
                    };
                }
                else
                {
                    savedData = new SavedData()
                    {
                        Id = 0,
                        IsSaved = false
                    };
                }

                if (isSuccess && xmlFlag)
                {
                    //Generate xml files for all the images been uploaded by user
                    foreach (var photo in dashboardData.Photos)
                    {
                        string path = Server.MapPath(GeneratedXMLVirtualPath) + string.Format("{0}_{1}.xml", photo.FileName, photo.Id);
                        var boundingBoxDataModels = await dashboardService.GetBoxByPhotoId(photo.Id);

                        annotation _annotation = new annotation(dashboardData.Labels, boundingBoxDataModels)
                        {
                            filename = photo.FileName,
                            path = path,
                            size ={
                                width = 640,
                                height =480,
                                depth = 0
                            }
                        };

                        System.Xml.Serialization.XmlSerializer writer =
                       new System.Xml.Serialization.XmlSerializer(typeof(annotation));

                        // var path = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + "//GeneratedPhotoXML.xml";
                        // string path = Server.MapPath(GeneratedXMLVirtualPath) + "//GeneratedPhotoXML.xml";

                        System.IO.FileStream file = System.IO.File.Create(path);

                        writer.Serialize(file, _annotation);
                        file.Close();
                    }                  
                }
               
                return Json(savedData);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }

    class SavedData
    {
        public int Id { get; set; }
        public bool IsSaved { get; set; }
    }

}