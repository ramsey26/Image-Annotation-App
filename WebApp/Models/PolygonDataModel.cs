using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    public class PolygonDataModel
    {
        public int? Id { get; set; }
        public int PolygonNo { get; set; }
        public Decimal StartX { get; set; }
        public Decimal StartY { get; set; }
        public Decimal EndX { get; set; }
        public Decimal EndY { get; set; }
        public int PhotoId { get; set; }
        public string Action { get; set; }
        public ICollection<LineSegmentDataModel> LineSegments { get; set; }
    }
}