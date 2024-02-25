# Classification & Segmentation with SamGeo for Irrigated Rice Fields

This repository was created to share the algorithms, files, and results of the article titled "Rice Field Segmentation: Influence of detailed features within the plots using Segment Anything Model Geospatial," published in the Journal of Information and Data Management - JIDM.

In this repository, you will find the following subjects:

### Topics

1. [Random Forest Classification in Google Earth Engine - GEE](#random-forest-classification-in-google-earth-engine---gee)
2. [Segmentation using the SamGEO algorithm in Google Colab](#segmentation-using-the-samgeo-algorithm-in-google-colab)
3. [Analysis of Time Series Extracted in Google Earth Engine](#analysis-of-time-series-extracted-in-google-earth-engine)

### Random Forest Classification in Google Earth Engine - GEE

By using the code [Irrigated Rice Areas Classification](RiceAreasClassification.js) and downloading the [Shapefile archives](Shapefiles) you can perform a Random Forest classification for irrigated rice areas in Turvo city. Also, you can use the follow link [Irrigated Rice Areas GEE - Link](https://code.earthengine.google.com/2ce75e8e35d500b803a56bdedd2f83b5) to perform the classification, all necessaries files are included in the previous link.

To perform the RFE and FSCORE analysis you need to access the follow link [RFE and FSCORE toolbox GEE - Link](https://code.earthengine.google.com/56e7af7a64fbdc0a364cee7b3ec3faa2) or go to the code [RFE and FSCORE toolbox](RFE_FSCORE_toolbox.js) in this shared in this repository.

With the above codes and archives you able to create an binary map with irrigated rice area for 2021/2022 season.

### Segmentation using the SamGEO algorithm in Google Colab

The segmentation approach applied to this study is based on [segment-geospatial](https://github.com/opengeos/segment-geospatial) repository, for a detailed explication about all functions, code development and other issues please visit [SAMGEO page](https://samgeo.gishub.org/).
In this study we perform a segmentation task over a pansharpned CBERS-4A/WPM image compostion. To download the pre-precessed image go to the [Images and Shapefiles](https://drive.google.com/drive/folders/1tRkOSdJ8wUMZbmBNreSMaNqGLGaC_8BZ?usp=sharing) Google Drive folder. The pre-process include some steps like cut to the image to the Region of Interest (ROI), apply pansharpening algorithm, create a 3 band panshapned image compostion and rescale the image in 0 to 255 range [image composition rescale script](rescale_ImageCompositon.py).
After process the image we've uploaded the CBERS-4A/WPM image compositon in Google Drive to perform the [SAMgeo script](SAMgeo_script.py) and get a detailed segmentation over the ROI.
The results of no-prompt raw segmentation also can be downloade in [Images and Shapefiles](https://drive.google.com/drive/folders/1tRkOSdJ8wUMZbmBNreSMaNqGLGaC_8BZ?usp=sharing) Google Drive folder.

### Analysis of Time Series Extracted in Google Earth Engine

To analyse and compare the impact of the use of a large area plot and a detailed segmented plot we performed a time series extraction in [Time Series extraction](https://code.earthengine.google.com/48bebc7a1e0254a66ea848a2d9ef127c) in Google Earth Engine platform, you can also access the []() in this repository.

