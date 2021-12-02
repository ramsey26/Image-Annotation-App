using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.DTOs
{
    public class LineSegmentDto
    {
        public int? Id { get; set; }
        public int PolygonNo { get; set; }
        public decimal X1 { get; set; }
        public decimal Y1 { get; set; }
        public decimal X2 { get; set; }
        public decimal Y2 { get; set; }
    }
}