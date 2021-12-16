using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class UserProjectViewModel
    {
        [Required]
        [Display(Name ="Name")]
        public string ProjectName { get; set; }
        public string Description { get; set; }
    }
}