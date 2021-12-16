using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class MemberDataModel
    {
        public MemberDataModel()
        {
            UserProjects = new List<UserProjectDataModel>();
        }

        public int Id { get; set; }
        public string UserName { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public bool IsActive { get; set; }
        public List<UserProjectDataModel> UserProjects { get; set; }
    }
}