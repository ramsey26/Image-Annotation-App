using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class UserProjectDataModel
    {
        public int Id { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime DateCreated { get; set; }
       // public List<PhotoDataModel> Photos { get; set; }
    }
}