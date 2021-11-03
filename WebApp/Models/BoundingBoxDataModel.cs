using Newtonsoft.Json;
using System;

namespace WebApp.Models
{
    public class BoundingBoxDataModel
    {
        public int? Id { get; set; }
        public decimal X1 { get; set; }
        public decimal Y1 { get; set; }
        public decimal X2 { get; set; }
        public decimal Y2 { get; set; }
        public double Angle { get; set; }
        public int BoundingBoxNumber { get; set; }
        public int PhotoId { get; set; }
        public string Action { get; set; }
    }
}