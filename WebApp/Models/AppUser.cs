using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class AppUser
    {
        [Required]
        [Display(Name = "Username")]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
    }
}