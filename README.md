# Classification & Segmentation with SamGeo for Irrigated Rice Fields

This repository was created to share the algorithms, files, and results of the article titled "Rice Field Segmentation: Influence of detailed features within the plots using Segment Anything Model Geospatial," published in the Journal of Information and Data Management - JIDM.

In this repository, you will find the following files:

### Topics

1. [Random Forest Classification in Google Earth Engine - GEE](#random-forest-classification)
2. [Segmentation using the SamGEO algorithm in Google Colab](#segmentation-with-samgeo)
3. [Analysis of Time Series Extracted in Google Earth Engine](#time-series-analysis)

### Random Forest Classification in Google Earth Engine - GEE

Description of the Random Forest classification process in Google Earth Engine.

### Segmentation using the SamGEO algorithm in Google Colab
```python
## Install the packages to use in code
# Import the libraries
import os
from samgeo import SamGeo, tms_to_geotiff, get_basemaps
import leafmap

# Given google drive permission (optional step if runs in a local machine)
from google.colab import drive
drive.mount('/content/drive')

# Visualize the base map of the area
m = leafmap.Map(center=[-28.907,-49.597], zoom=11) #You can change the coordinates and zoom according to the area
m.add_basemap("SATELLITE")
m

# Path to the TIFF file in your Google Drive
image = '/content/drive/MyDrive/{your_image_path.tif}'
image

# Add your image to the base map
m.layers[-1].visible = False  # turn off the basemap
m.add_raster(image, layer_name="Image")
m

# Set the directory and download the Vit_H training
out_dir = os.path.join(os.path.expanduser("~"), "Downloads")
checkpoint = os.path.join(out_dir, "sam_vit_h_4b8939.pth")

# Define SAMgeo parameters
sam = SamGeo(model_type="vit_h", checkpoint=checkpoint, sam_kwargs=None)

# Set the path to save your segmented mask and generate the segmented mask
mask = "/content/drive/MyDrive/{your_path_to_segmented_Mask.tif}"
sam.generate(image, mask, batch=True, foreground=False, erosion_kernel=(3, 3))

# Set the path to save the segmented shapefile and convert the image mask to a shapefile format
shapefile = "/content/drive/MyDrive/{your_path_to_segmented_shapefile.shp}"
sam.tiff_to_vector(mask, shapefile)
```
### Analysis of Time Series Extracted in Google Earth Engine

Details about the analysis of time series data extracted in Google Earth Engine.

