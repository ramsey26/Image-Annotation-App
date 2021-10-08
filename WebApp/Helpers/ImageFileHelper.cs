using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Helpers
{
    public static class ImageFileHelper
    {
        public static string WriteImageFile(this byte[] image, string currentservermainpath,string baseDirectoryVirtual, string baseFileName)
        {
            string fileName = baseFileName;
            string fullFileName = currentservermainpath + fileName;
           
                try
                {
                    System.IO.File.WriteAllBytes(fullFileName, image);
                }
                catch (Exception ex)
                {
                throw ex;
                }
           
            return (baseDirectoryVirtual + fileName);
        }
    }
}