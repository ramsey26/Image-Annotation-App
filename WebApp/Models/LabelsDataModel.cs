using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class LabelsDataModel
    {
        public int Id { get; set; }
        public string LabelName { get; set; }
        public string Color { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public int UserProjectId { get; set; }
    }
}