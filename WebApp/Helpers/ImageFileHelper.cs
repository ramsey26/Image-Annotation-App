using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace WebApp.Helpers
{
    public static class ImageFileHelper
    {
        public static string WriteImageFile(this byte[] image, string currentservermainpath,string baseDirectoryVirtual, int baseFileName)
        {
            //string fileNameForPath = baseFileName.Replace(' ', '-');

            //string openBracketsRemovedPath = fileNameForPath.Replace('(', ' ');
            //string closeBracketsRemovedPath = openBracketsRemovedPath.Replace(')', '-');

            string fileName = Convert.ToString(baseFileName) + ".jpg";
            string fullFileName = currentservermainpath + fileName ;

            if ((File.Exists(fullFileName) == false))
            {
                try
                {
                    File.WriteAllBytes(fullFileName, image);
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
            return (baseDirectoryVirtual + fileName);
        }

        public static bool DeleteDirectoryFiles(this string directoryPath)
        {
            if (Directory.Exists(directoryPath))
            {
                var files = Directory.GetFiles(directoryPath);
                if (files.Count() > 0)
                {
                    foreach(var file in files)
                    {
                        File.Delete(file);
                    }
                    return true;
                }
            }
            return false;
        }
    }
}