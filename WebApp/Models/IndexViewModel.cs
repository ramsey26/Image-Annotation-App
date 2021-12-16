using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class IndexViewModel
    {
        public string JavascriptToRun { get; set; }
        public UserProjectViewModel UserProjectViewModel { get; set; }
        public IEnumerable<UserProjectDataModel> UserProjectDataModels { get; set; }
    }
}