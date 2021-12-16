using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApp.DTOs;

namespace WebApp.Models
{
    [Serializable]
    public class DashboardViewModel
    {
        public UserProjectsWithPhotosDto UserProjectWithPhotosDto { get; set; }
        public FileUploadModel FileUploadModel { get; set; }

        public DashboardViewModel()
        {
            UserProjectWithPhotosDto = new UserProjectsWithPhotosDto();
            FileUploadModel = new FileUploadModel(); 
        }
    }
}