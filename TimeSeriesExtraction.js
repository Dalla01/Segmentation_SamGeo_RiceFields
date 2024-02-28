/*'''
# -*- coding: utf-8 -*-

Send email and msg
@author: Andre

'''*/


// - Import the SIAC atmospheric correction module (needed to collections before december 2018 in Brazil)
var siac = require('users/marcyinfeng/utils:SIAC');
//setting some cloud filter parameters
var MAX_CLOUD_PROBABILITY = 25
var limiteNuvens = 50
//setting intial and final dates os time series
var dataInicio = '2021-07-01'
var dataFinal = '2022-07-01'
//setting the Region of Interest
var geometriaInteresse = deitaled_plots /*you can change between general and deitaled plots 
to exctrat the time series values */

// Define a function to format an image timestamp as a JavaScript Date string human-readable.
function formatDate(img) {
  var epoch= img.get('system:time_start')
  var readableDate = ee.Date(epoch)
  var stringDate = readableDate.format('YYYY-MM-dd')
  var updateImg = img.set('ANO_MES_DIA', stringDate)
  return updateImg;
}

//Function to exclude some properties
function excludeProp (image)
                    {return ee.Image([]).addBands(image)
                    .copyProperties({source: image, properties: ['ANO_MES_DIA', 'PRODUCT_ID',
                    'system:index']})}


// Functions to remove clouds and shadows
function maskClouds(img) {
  var clouds = ee.Image(img.get('cloud_mask')).select('probability');
  var isNotCloud = clouds.lt(MAX_CLOUD_PROBABILITY);
  return img.updateMask(isNotCloud);
}
function isclouds (img){
  return img.where(img.gte(MAX_CLOUD_PROBABILITY), 1)
  .where(img.lte(MAX_CLOUD_PROBABILITY), 0)
}

//Getting the collection with clouds probability
var collectionS2clouds =  ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
              .filterDate(dataInicio, dataFinal)
              .filterBounds(geometriaInteresse);

//Getting the Sentinel-2 image collection
var collectionOriginalS2 = ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
  .filterBounds(geometriaInteresse)
  .filterDate(dataInicio, dataFinal)
  .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', limiteNuvens);


// Join S2 SR with cloud probability dataset to add cloud mask.
var collectionS2WithCloudMask = ee.Join.saveFirst('cloud_mask').apply({
  primary: collectionOriginalS2,
  secondary: collectionS2clouds,
  condition:
      ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
});

//Apply cloud mask and generating the pre-processed image collection
var ColS2preProcess = ee.ImageCollection(collectionS2WithCloudMask).map(maskClouds)

//Use SIAC to generate Surface Reflectance Image Collection
var SrCollectionS2 = ColS2preProcess.map(siac.get_sur)


//Function to calculate NDVI
function addOpticalIndices (img){
            var NDVI =  img.expression(
                '(NIR - RED) / (NIR + RED)', { 
                'NIR': img.select('B8'),
                'RED': img.select('B4'),
                }).rename('NDVI');
  return img.addBands([NDVI]);
}

//Add NDVI band to image collection
var SrCollectionS2Indexes = SrCollectionS2.map(addOpticalIndices);
//Add an human-readable date property
var SrCollectionS2Indexes = SrCollectionS2Indexes.select(['NDVI']).map(formatDate)
//Exclude additional properties (make csv more clean/light)
var SrCollectionS2Indexes = SrCollectionS2Indexes.map(excludeProp)

//Function to extract pixels values by geomtries mean
var extracted = ee.FeatureCollection(SrCollectionS2Indexes.map(function (img) {
  var stats = img.reduceRegions({
    collection: geometriaInteresse,
    reducer: ee.Reducer.mean(),
    scale: 10,
  });

  var featsWithStats = stats.map(function (feat) {
    var Dia = ee.List(img.get('ANO_MES_DIA'));
    return feat.set({
      'Data': Dia
    });
  });

  return featsWithStats;
})).flatten();
//--------------------------------------------------------------------------------------------------
//                             Export to drive 
//--------------------------------------------------------------------------------------------------
//Get the name of the asset to set file name automaticaly
var assetName = ee.String(general_plot.get("system:id"));
var assetNameParts = assetName.split('/');
var finalName = assetNameParts.get(-1).getInfo();

//Export the result to Google Drive
Export.table.toDrive({
    collection: extracted,
    description: 'TimeSeries_of_'+finalName,
    fileNamePrefix: 'TimeSeries_of_'+finalName,
    fileFormat: 'CSV',
    });




