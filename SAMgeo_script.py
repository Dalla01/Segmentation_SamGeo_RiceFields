# -*- coding: utf-8 -*-
"""
Send email and msg
@author: Andre Garcia, Victor Prudente, Michel Chaves, Darlan Teles, Ieda Sanches and Kleber Trabaquini
Adapted from: https://samgeo.gishub.org/examples/satellite/
"""

# Install the packages to use in code
!pip install segment-geospatial leafmap localtileserver

# Import the libraries
import os
from samgeo import SamGeo, tms_to_geotiff, get_basemaps
import leafmap

# Given google drive permission (optional step if runs in a local machine)
from google.colab import drive
drive.mount('/content/drive')

# Visualize the base map of the area
m = leafmap.Map(center=[-28.907,-49.597], zoom=11) #This coordinates center to Turvo city, you can change the coordinates and zoom according to the area
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
