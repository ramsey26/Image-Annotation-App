using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    [Serializable]
    public class DashboardViewModel
    {
        public MemberDataModel MemberDataModel { get; set; }
        public FileUploadModel FileUploadModel { get; set; }

        public DashboardViewModel()
        {
            MemberDataModel = new MemberDataModel();
            FileUploadModel = new FileUploadModel(); 
        }
    }
}