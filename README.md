# Classification & Segmentation with SamGeo for Irrigated Rice Fields

This repository was created to share the algorithms, files, and results of the article titled "Rice Field Segmentation: Influence of detailed features within the plots using Segment Anything Model Geospatial," published in the Journal of Information and Data Management - JIDM.

In this repository, you will find the following files:

### Topics

1. [Random Forest Classification in Google Earth Engine - GEE](#random-forest-classification)
2. [Segmentation using the SamGEO algorithm in Google Colab](#segmentation-with-samgeo)
3. [Analysis of Time Series Extracted in Google Earth Engine](#time-series-analysis)

### Random Forest Classification in Google Earth Engine - GEE

```javascript
var ptbx=require('users/adbg50/GEOINFO2023:toolBox_001');
var scale = 20;
var tileScale = 16;
// ============================================================================================================
//                                         SENTINEL-2
// ============================================================================================================
// --------------  Loading an ImageCollection and filtering to a single image ------------------

var Image_Jul = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-07-17', '2021-07-19'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-07-18').millis());

var Image_Aug = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-08-21', '2021-08-23'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-08-22').millis());

var Image_Sep = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-09-25', '2021-09-27'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-09-26').millis());

var Image_Oct = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-10-25', '2021-10-27'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-10-26').millis());

var Image_Nov = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-11-24', '2021-11-26'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-11-25').millis());

var Image_Dec = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-12-19', '2021-12-21'))
              .filter(ee.Filter.bounds(roi)) // shp that defines the local of study
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-12-20').millis());


var Images = ee.ImageCollection.fromImages([Image_Jul, Image_Aug, Image_Sep, 
                                            Image_Oct, Image_Nov, Image_Dec]);
                                            
// print(Images)
var ImageMax = Images.reduce(ee.Reducer.max());
var ImageMin = Images.reduce(ee.Reducer.min());
var ImageMean = Images.reduce(ee.Reducer.mean());
var ImageStd = Images.reduce(ee.Reducer.stdDev());

var Imagem = ee.Image.cat(ImageMax, ImageMin, ImageMean, ImageStd).clip(roi);

//--------------- Sample Imagery at Training Points to Create datasets ------------------------------
// Select the bands for training
                                
var bands = ['B2_max', 'B3_max', 'B4_max', 'B8_max', 'B11_max', 'B12_max',
            'B2_min', 'B3_min', 'B4_min', 'B8_min', 'B11_min', 'B12_min',
            'B2_mean', 'B3_mean', 'B4_mean', 'B8_mean', 'B11_mean', 'B12_mean',
            'B2_stdDev', 'B3_stdDev', 'B4_stdDev', 'B8_stdDev', 'B11_stdDev', 'B12_stdDev'];

// Sample the input imagery to get a FeatureCollection of training data.
var training = Imagem.select(bands).sampleRegions({
  collection: newfc,
  properties: ['LULC'],
  scale: 10
});

var sampling = training.randomColumn({'seed':1});
var training = sampling.filter('random <= 0.7'); //aprox. 2800 pts
var validation = sampling.filter('random > 0.7'); //aprox. 1200 pts

//---------------------- Train the classifier --------------------------------------------------
// Make a Random Forest classifier and train it.
var classifier = ee.Classifier.smileRandomForest({'numberOfTrees':50, 'seed':1}).train({
  features: training,
  classProperty: 'LULC',
  inputProperties: bands
});

//---------------------- Classify the Image & Display the Results ------------------------------

//obtem a importância de cada variável
var dict = classifier.explain();
//print('Explain:',dict);
var variable_importance = ee.Feature(null, ee.Dictionary(dict).get('importance'));

// Classify the input imagery.
var classified = Imagem.select(bands).classify(classifier);

// Define a palette for the Land Use classification.
var palette = [
  'yellow', // Não Arroz (0)
  'gray', //Arroz (1)
];

// Get a confusion matrix and overall accuracy for the training sample.
var trainAccuracy_matrix = classifier.confusionMatrix();
var trainAccuracy = trainAccuracy_matrix.accuracy()

// Get a confusion matrix and overall accuracy for the validation sample.
validation = validation.classify(classifier);
var validationAccuracy_matrix = validation.errorMatrix('LULC', 'classification');
var validationAccuracy = validationAccuracy_matrix.accuracy()


// Get a confusion matrix representing resubstitution accuracy.
// print('training error matrix: ', trainAccuracy_matrix);
// print('training accuracy: ', trainAccuracy);
// print('validation error matrix: ', validationAccuracy_matrix);
// print('validation accuracy: ', validationAccuracy);

print(' ----- RFE resultados ----- ');
//Função do RFE
//ptbx.RFE_analysis(Imagem, newfc, scale, tileScale);


// Display the classification result and the input image.
Map.centerObject(roi, 10);
Map.addLayer(classified.clip(roi), {min: 0, max: 1, palette: palette}, 'Land Use Classification', false);
// Map.addLayer(Imagem.clip(roi), {bands:['B8_mean','B11_mean','B4_mean'],min:265,max:3390},'Falsa Cor ', false);
// Map.addLayer(Imagem.clip(roi), {bands:['B4_mean','B3_mean','B2_mean'], min:200,max:1010},'Cor Verdadeira ', false);
// Map.addLayer(newfc, {}, 'pontos', false)

// ------------------------------------------------------------------------------
//                     GERAR O GRÁFICO DE IMPORTÂNCIA
// ------------------------------------------------------------------------------
// var chart =
//   ui.Chart.feature.byProperty(variable_importance)
//     .setChartType('ColumnChart')
//     .setOptions({
//       title: 'Random Forest Variable Importance',
//       legend: {position: 'none'},
//       hAxis: {title: 'Bands'},
//       vAxis: {title: 'Importance'}
//     });


// print(chart); 

//------------------------------------------------------------------------------
//                     Create a time series chart
//------------------------------------------------------------------------------

// var TSchart = ui.Chart.image.series({
//   imageCollection: Images,
//   region: rice,
//   reducer: ee.Reducer.mean(),
//   scale: 10
// }).setOptions({
//   title: 'Rice Time Series',
//   vAxis: {title: 'Reflectance'},
//   hAxis: {title: 'Date', format: 'YYYY-MM-dd'},
// });

// // Display the chart
// print(TSchart);

// //====================================
// //EXPORTANDO A COMPOSIÇÃO PARA O DRIVE
// //====================================

// Export.image.toDrive({
//   image: classified.clip(roi), 
//   description: 'RF_classified_new',
//   folder: 'ArquivosGEOINFO2023',  // Pasta do drive 
//   region: roi, 
//   scale: 10, 
//   crs: 'EPSG:4326',  // WGS84 - No caso de uma composição, precisamos especificar explicitamente.
//   //maxPixels: 1e9,
//   fileFormat: 'GeoTIFF'});
```

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

