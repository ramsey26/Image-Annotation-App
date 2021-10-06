using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebApp.Helpers
{
    public class AllowExtensionsAttribute : ValidationAttribute
    {
        /// <summary>  
        /// Gets or sets extensions property.  
        /// </summary>  
        public string Extensions { get; set; } = "png,jpg,jpeg";

        /// <summary>  
        /// Is valid method.  
        /// </summary>  
        /// <param name="value">Value parameter</param>  
        /// <returns>Returns - true is specify extension matches.</returns>  
        public override bool IsValid(object value)
        {
            HttpPostedFileBase file = value as HttpPostedFileBase;
            bool isValid = true;

            List<string> allowedExtensions = this.Extensions.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList();
            if (file != null)
            {
                var fileName = file.FileName;
                isValid = allowedExtensions.Any(y => fileName.EndsWith(y));
            }

            return isValid;
        }
    }
}