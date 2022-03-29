using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.Models
{
    [Serializable]
    public class annotation
    {
        public annotation()
        {

        }

        public annotation(List<LabelsDataModel> labels, List<BoundingBoxDataModel> boxes)
        {
            source = new source();
            size = new size();
            objects = new List<Object>();
            foreach (var label in labels)
            {
                var boxesByLabelId = boxes.Where(x => x.LabelId == label.Id).ToList();

                var obj = new Object(boxesByLabelId)
                {
                    name = label.Id
                };
                objects.Add(obj);
            }          
        }

        public string folder { get; set; } = "GeneratedXML";
        public string filename { get; set; }
        public string path { get; set; }
        public source source { get; set; }
        public size size { get; set; }
        public int segmented { get; set; } = 0;
        public List<Object> objects { get; set; }
    }

    public class source
    {
        public string database { get; set; } = "Unknown";
    }
    public class size
    {
        public int width { get; set; }
        public int height { get; set; }
        public int depth { get; set; }
    }

    [Serializable]
    public class Object
    {
        public Object()
        {

        }

        public Object(List<BoundingBoxDataModel> boundingBoxes)
        {
            boxes = new List<bndbox>();

            foreach (var box in boundingBoxes)
            {
                var objBox = new bndbox()
                {
                    xmin = box.X1,
                    xmax = box.X2,
                    ymin = box.Y1,
                    ymax = box.Y2
                };
                boxes.Add(objBox);
            }
          
        }
        public int name { get; set; }
        public string pose { get; set; } = "Frontal";
        public int truncated { get; set; } = 0;
        public int difficult { get; set; } = 0;
        public int occluded { get; set; } = 0;
        public List<bndbox> boxes { get; set; }
    }

    public class bndbox
    {
        public decimal xmin { get; set; }
        public decimal xmax { get; set; }
        public decimal ymin { get; set; }
        public decimal ymax { get; set; }
    }

}