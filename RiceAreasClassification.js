//Setting the file to perform RFE and FSCORE functions
var ptbx=require('users/adbg50/JIDM_archieves:toolBox');

// Setting scales
var scale = 10;
var tileScale = 16;

// --------------  Loading an ImageCollection and filtering to a single image ------------------

var Image_Jul = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-07-17', '2021-07-19'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-07-18').millis());

var Image_Aug = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-08-21', '2021-08-23'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-08-22').millis());

var Image_Sep = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-09-25', '2021-09-27'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-09-26').millis());

var Image_Oct = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-10-25', '2021-10-27'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-10-26').millis());

var Image_Nov = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-11-24', '2021-11-26'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-11-25').millis());

var Image_Dec = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
              .filter(ee.Filter.date('2021-12-19', '2021-12-21'))
              .filter(ee.Filter.bounds(roi))
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .select(['B2','B3', 'B4','B8', 'B11', 'B12'])
              .mean().divide(10000).set('system:time_start', ee.Date('2021-12-20').millis());


//Create an Image Collection with filtered images
var Images = ee.ImageCollection.fromImages([Image_Jul, Image_Aug, Image_Sep, 
                                            Image_Oct, Image_Nov, Image_Dec]);
                                            

//Extract metrics from feature collection
var ImageMax = Images.reduce(ee.Reducer.max());
var ImageMin = Images.reduce(ee.Reducer.min());
var ImageMean = Images.reduce(ee.Reducer.mean());
var ImageStd = Images.reduce(ee.Reducer.stdDev());

// Create a single image with bands metrics and clip to ROI
var Imagem = ee.Image.cat(ImageMax, ImageMin, ImageMean, ImageStd).clip(roi);


// Select the bands for training
var bands = ['B2_max', 'B3_max', 'B4_max', 'B8_max', 'B11_max', 'B12_max',
            'B2_min', 'B3_min', 'B4_min', 'B8_min', 'B11_min', 'B12_min',
            'B2_mean', 'B3_mean', 'B4_mean', 'B8_mean', 'B11_mean', 'B12_mean',
            'B2_stdDev', 'B3_stdDev', 'B4_stdDev', 'B8_stdDev', 'B11_stdDev', 'B12_stdDev'];

// Sample the input imagery to get a FeatureCollection of training data.
var training = Imagem.select(bands).sampleRegions({
  collection: RiceSamples,
  properties: ['LULC'],
  scale: 10
});
var sampling = training.randomColumn({'seed':1});
var training = sampling.filter('random <= 0.7');
var validation = sampling.filter('random > 0.7');

// Train the classifier 
var classifier = ee.Classifier.smileRandomForest({'numberOfTrees':50, 'seed':1}).train({
  features: training,
  classProperty: 'LULC',
  inputProperties: bands
});

//---------------------- Classify the Image & Display the Results ------------------------------

//Get a dictionary with classifier details
var dict = classifier.explain();
//print('Explain:',dict); //Remove comment to print in console

//Get variable importance for the actual classifier
var variable_importance = ee.Feature(null, ee.Dictionary(dict).get('importance'));

// Classify the input imagery.
var classified = Imagem.select(bands).classify(classifier);

// Define a palette for the Land Use classification, to show in map layer.
var palette = [
  'yellow', // not rice (0)
  'gray', // rice (1)
];

// Get a confusion matrix and overall accuracy for the training sample.
var trainAccuracy_matrix = classifier.confusionMatrix();
var trainAccuracy = trainAccuracy_matrix.accuracy()

// Get a confusion matrix and overall accuracy for the validation sample.
validation = validation.classify(classifier);
var validationAccuracy_matrix = validation.errorMatrix('LULC', 'classification');
var validationAccuracy = validationAccuracy_matrix.accuracy()


/*Get a confusion matrix representing resubstitution accuracy. 
  Uncomment lines between 120 to 123 to print results */
  
// print('training error matrix: ', trainAccuracy_matrix);
// print('training accuracy: ', trainAccuracy);
// print('validation error matrix: ', validationAccuracy_matrix);
// print('validation accuracy: ', validationAccuracy);

/*Apply RFE function requesting toolBox file 
(this functions exports the csv files to yout Google drive)*/

//RFE function
ptbx.RFE_analysis(Imagem, RiceSamples, scale, tileScale);
//FSCORE function
ptbx.FScore_analysis(ee.Feature(variable_importance));

// Display some results and assets in the map layer.
Map.centerObject(roi, 10);
Map.addLayer(classified.clip(roi), {min: 0, max: 1, palette: palette}, 'Land Use Classification', false);
Map.addLayer(RiceSamples, {}, 'Samples', false)


// //====================================
// //Export classification to Google Drive
// //====================================

// Export.image.toDrive({
//   image: classified.clip(roi), 
//   description: 'IrrigatedRice_areas_2021_2022',
//   region: roi, 
//   scale: 10, 
//   crs: 'EPSG:4326',
//   //maxPixels: 1e9,
//   fileFormat: 'GeoTIFF'});
