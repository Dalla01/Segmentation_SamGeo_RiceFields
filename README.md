# Classification & Segmentation with SamGeo for Irrigated Rice Fields

This repository was created to share the algorithms, files, and results of the article titled "Rice Field Segmentation: Influence of detailed features within the plots using Segment Anything Model Geospatial," published in the Journal of Information and Data Management - JIDM.

In this repository, you will find the following subjects:

### Topics

1. [Random Forest Classification in Google Earth Engine - GEE](#random-forest-classification)
2. [Segmentation using the SamGEO algorithm in Google Colab](#segmentation-with-samgeo)
3. [Analysis of Time Series Extracted in Google Earth Engine](#time-series-analysis)

### Random Forest Classification in Google Earth Engine - GEE

By using the code [Irrigated Rice Areas Classification](RiceAreasClassification.js) and downloading the [Shapefile archives](Shapefiles) you can perform a Random Forest classification for irrigated rice areas in Turvo city. Also, you can use the follow link [Irrigated Rice Areas GEE - Link](https://code.earthengine.google.com/2ce75e8e35d500b803a56bdedd2f83b5) to perform the classification, all necessaries files are included in the previous link.

### Creating an additional file to request RFE and FSCORE functions
```javascript
//Biblioteca de funções
// RFE function:
function RFE_analysis (composite, sampleCollection, scale, tileScale){  
  // Get band names
  var bandNames = ee.Image(composite).bandNames();
  //print('bandNames', bandNames)
  
  // Initialize an empty List for storing accuracy
  var trainAccuracies = ee.List([]);
  var valAccuracies = ee.List([]);
  // Initialize an empty List for storing variable importance
  var variableImportance = ee.List([]);
  
  var sampling = composite.select(bandNames).sampleRegions({
      collection: sampleCollection,
      properties: ['LULC'],
      scale: scale,
      tileScale: tileScale,
  });
  sampling = sampling.randomColumn({'seed':1});
  var training = sampling.filter('random <= 0.7');
  var validation = sampling.filter('random > 0.7');

  //define o classificador:
  var classifier = ee.Classifier.smileRandomForest({'numberOfTrees':50, 'seed':1});
  
  // Define a function for iterative classification
  function iterativeClassification(currentBandNames) {
    
    // Train classifier
    var trained = classifier.train({
    features: training,
    classProperty: 'LULC',
    inputProperties: currentBandNames
    });
  
    // Compute accuracy on training set
    var trainAccuracy = trained.confusionMatrix().accuracy();
  
    // Compute accuracy on validation set
    var validated = validation.classify(trained);
    var valAccuracy = validated.errorMatrix('LULC', 'classification').accuracy();
  
    // Store accuracies
    trainAccuracies = trainAccuracies.add(trainAccuracy);
    valAccuracies = valAccuracies.add(valAccuracy);
  
    // Get variable importance
    var dict = trained.explain();
    var variable_importance = ee.Dictionary(dict.get('importance'));
  
    // Store variable importance
    variableImportance = variableImportance.add(variable_importance);
  
    // Convert dictionary to separate lists of keys and values
    var keysList = variable_importance.keys();
    var valuesList = variable_importance.values();
    //print(keysList)
    
    
    
    // Find index of minimum value
    var minIndex = valuesList.indexOf(valuesList.reduce(ee.Reducer.min()));
    //print('minIndex', minIndex)
    
    var orderMin = valuesList.sort()
    //print('orderMin', orderMin)
    
    
    // Get key corresponding to minimum value (least important band)
    var leastImportantBand = keysList.get(minIndex);
    //print('leastImportantBand', leastImportantBand)
    
    // Remove least important band from band list
    currentBandNames = ee.List(currentBandNames).remove(leastImportantBand);

    return currentBandNames;
    
  }

  //Método limitando o número de iter
  var iteration = 1;
  while (bandNames.length().getInfo() > 1 && iteration < 25) {
      bandNames = ee.List(iterativeClassification(bandNames));
      iteration = iteration + 1;
  }
 
 // Convert list to a FeatureCollection
  var trainAccuraciesFC = ee.FeatureCollection(trainAccuracies.map(function(item){
    return ee.Feature(null, {'value': item}); // Assuming each item in the list is a value
  }));
  
  // Export the FeatureCollection to Google Drive as CSV
  Export.table.toDrive({
    collection: trainAccuraciesFC,
    description: 'trainAccuraciesFC',
    fileFormat: 'CSV'
  });
 
   var valAccuraciesFC = ee.FeatureCollection(valAccuracies.map(function(item){
    return ee.Feature(null, {'value': item}); // Assuming each item in the list is a value
  }));
  
  // Export the FeatureCollection to Google Drive as CSV
  Export.table.toDrive({
    collection: valAccuraciesFC,
    description: 'valAccuraciesFC',
    fileFormat: 'CSV'
  });
 
 // Print the accuracy list and variable importance list
  // print('Training Accuracies RFE:', trainAccuracies);
  // print('Validation Accuracies RFE:', valAccuracies);
  // print('Variable Importance RFE:', variableImportance);
  
  
  
}

// Fscore function:  
function FScore_analysis (ImportanceFeat){
  var FeatImpDict = (ee.Feature(ImportanceFeat).toDictionary())
  
  var Valores =ee.List(FeatImpDict.values())
  var Chaves = ee.List(FeatImpDict.keys())
  
  var getPercentage = function(lista) {
    // Calcula o valor total das importancias
    var total = ee.Number(lista.reduce(ee.Reducer.sum()));
    
    // Função para calcular o percentual
    var calculatePercentage = function(element) {
      return ee.Number(element).divide(total).multiply(100);
    };
    
    // Usando a função .map() para calcular o percentual e atribuir os resultados a lista
    var percentList = ee.List(lista).map(calculatePercentage);
    
    return percentList;
  };
  
  var listaPercentual = getPercentage(Valores)
  
  var Redict =ee.Dictionary.fromLists(Chaves, listaPercentual)
  print('Feature Score (%):', Redict)
}  


// --------------------------------------------------------------------------------------------
//               Exporta funçoes para uso em outros scripts
// --------------------------------------------------------------------------------------------
exports.RFE_analysis=RFE_analysis;
exports.FScore_analysis=FScore_analysis;

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

