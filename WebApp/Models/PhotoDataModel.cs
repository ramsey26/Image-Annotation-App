using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class PhotoDataModel
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileContentType { get; set; }
        public string FileContent { get; set; }
        public string ImageVirtualPath { get; set; }
       // public List<BoundingBoxDataModel> BoundingBoxes { get; set; }
    }
}