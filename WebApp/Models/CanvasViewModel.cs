using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    [Serializable]
    public class CanvasViewModel
    {
        public CanvasViewModel()
        {
            PhotoDataModel = new PhotoDataModel();
            BoundingBoxDataModels = new List<BoundingBoxDataModel>();
        }

        public PhotoDataModel PhotoDataModel { get; set; }
        public List<BoundingBoxDataModel> BoundingBoxDataModels { get; set; }


    }
}