using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApp.Models;

namespace WebApp.DTOs
{
    public class UserProjectsWithPhotosDto
    {
        public int Id { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public DateTime DateCreated { get; set; }
        public List<PhotoDataModel> Photos { get; set; }
    }
}