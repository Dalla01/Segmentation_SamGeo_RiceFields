# Classification & Segmentation with SAMgeo for Irrigated Rice Fields

This repository was created to share the algorithms, files, and results of the article titled "Rice Field Segmentation: Influence of detailed features within the plots using Segment Anything Model Geospatial," which was published in the Journal of Information and Data Management (JIDM).

In this repository, you will find the following subjects:

## Topics

1. [Random Forest Classification in Google Earth Engine - GEE](#random-forest-classification-in-google-earth-engine---gee)
2. [Segmentation using the SAMgeo algorithm in Google Colab](#segmentation-using-the-samgeo-algorithm-in-google-colab)
3. [Analysis of Time Series Extracted in Google Earth Engine](#analysis-of-time-series-extracted-in-google-earth-engine)

### Random Forest Classification in Google Earth Engine - GEE

By using the code [Irrigated Rice Areas Classification](RiceAreasClassification.js) and downloading the [Shapefile archives](Shapefiles), you can perform a Random Forest classification for irrigated rice areas in Turvo city. Also, you can use the following link [Irrigated Rice Areas GEE - Link](https://code.earthengine.google.com/2ce75e8e35d500b803a56bdedd2f83b5) to perform the classification; all necessary files are included in the previous link.

To perform the RFE and FSCORE analysis, you need to access the following link [RFE and FSCORE toolbox GEE - Link](https://code.earthengine.google.com/56e7af7a64fbdc0a364cee7b3ec3faa2) or go to the code [RFE and FSCORE toolbox](RFE_FSCORE_toolbox.js) shared in this repository.

With the above codes and archives, you are able to create a binary map with irrigated rice area for the 2021/2022 season.

### Segmentation using the SAMgeo algorithm in Google Colab

The segmentation approach applied to this study is based on the [segment-geospatial](https://github.com/opengeos/segment-geospatial) repository. For a detailed explanation about all functions, code development, and other issues, please visit the [SAMGEO page](https://samgeo.gishub.org/).
In this study, we performed a segmentation task over a pansharpened CBERS-4A/WPM image composition. To download the pre-processed image, go to the [Images and Shapefiles](https://data.mendeley.com/preview/czfnyg8bkv?a=aace6d0b-1cbc-46e3-939a-00098fbbb23c) Mendeley Data folder. The pre-process includes some steps like cutting the image to the Region of Interest (ROI), applying a pansharpening algorithm, creating a 3-band pansharpened image composition, and rescaling the image in the range 0 to 255. [Image composition rescale script](rescale_ImageCompositon.py).
After processing the image, we've uploaded the CBERS-4A/WPM image composition to Google Drive to perform the [SAMgeo script](SAMgeo_script.py) and obtain a detailed segmentation over the ROI.
The results of non-prompt raw segmentation can also be downloaded in the [Images and Shapefiles](https://data.mendeley.com/preview/czfnyg8bkv?a=aace6d0b-1cbc-46e3-939a-00098fbbb23c) Mendeley Data folder.

If you want to analyze an other local or date using CBERS-4A/WPM data go to [INPE](http://www.dgi.inpe.br/catalogo/explore) satellite image catalog website.

If you want to copy packages and environment configurations just download and install the [Conda Environmet settings](condaEnvironment.yml)

### Analysis of Time Series Extracted in Google Earth Engine

To analyze and compare the impact of the use of a large area plot and a detailed segmented plot, we performed a [Time Series extraction](https://code.earthengine.google.com/48bebc7a1e0254a66ea848a2d9ef127c) in the Google Earth Engine platform. You can also access the [code](TimeSeriesExtraction.js) in this repository. If you choose to run the script on the Google Earth platform, the general plot and detailed plot are already shared, but if you want to adapt the code or inspect the plots, you can download them in the [Shapefile archives](Shapefiles) folder.
After extracting the time series, download them and save in a folder, you can analyze each plot time series by performing the [Time Series chart generaton](TimeSeriesCharts.py) script in Pyhton. Using the general plot shapefile, you will get a unique chart for the entire area; using the detailed plot, you will get a bunch of time series to analyze them individually.

In this study, we focus only on a unique city in Santa Catarina state. You can see all irrigated rice areas in Brazil for different seasons at the [ANA](https://metadados.snirh.gov.br/geonetwork/srv/api/records/1ac9b37f-0745-44f9-a60b-6a2bd366bbe1) website.

### License

The content of this project itself is licensed under the [Creative Commons Attribution 4.0 International license]( https://creativecommons.org/licenses/by/4.0/), and the underlying source code used to format and display that content is licensed under the [MIT license](LICENSE).
