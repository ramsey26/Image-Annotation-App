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
            PolygonDataModels = new List<PolygonDataModel>();
        }

        public PhotoDataModel PhotoDataModel { get; set; }
        public List<BoundingBoxDataModel> BoundingBoxDataModels { get; set; }

        public List<PolygonDataModel> PolygonDataModels {get; set; }
    }
}