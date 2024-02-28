/*'''
# -*- coding: utf-8 -*-

Send email and msg
@author: Andre

'''*/

// RFE function:
function RFE_analysis (composite, sampleCollection, scale, tileScale){  
  // Get band names
  var bandNames = ee.Image(composite).bandNames();
  //print('bandNames', bandNames)
  
  // Initialize an empty List for storing accuracy.
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

  //define the classifier:
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

  //Limit the number of iteration equal = n_variables+1
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

// FScore function
function FScore_analysis (ImportanceFeat){
  // Convert the feature to a dictionary
  var FeatImpDict = ee.Feature(ImportanceFeat).toDictionary();
  
  // Get the values and keys of the dictionary
  var Valores = FeatImpDict.values();
  var Chaves = FeatImpDict.keys();
  
  // Function to calculate the percentage
  var getPercentage = function(lista) {
    // Calculate the total importance values
    var total = lista.reduce(ee.Reducer.sum());
    
    // Function to calculate the percentage
    var calculatePercentage = function(element) {
      return ee.Number(element).divide(total).multiply(100);
    };
    
    // Use map() to calculate the percentage
    var percentList = lista.map(calculatePercentage);
    
    return percentList;
  };
  
  // Calculate the percentage values
  var listaPercentual = getPercentage(Valores);
  
  // Create a dictionary from keys and percentage values
  var Redict = ee.Dictionary.fromLists(Chaves, listaPercentual);
  
  // Convert the dictionary to a feature
  var Redict_feat = ee.Feature(null, Redict);
  
  // Print the feature to check
  print(Redict_feat);
  
  // Create and print the chart
  var chart = ui.Chart.feature.byProperty(Redict_feat)
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Random Forest Variable Importance',
      legend: {position: 'none'},
      hAxis: {title: 'Bands/Metrics'},
      vAxis: {title: '% Importance'}
    });
  
  print(chart); 
}


// --------------------------------------------------------------------------------------------
//               Export the functions to be used in others scripts
// --------------------------------------------------------------------------------------------
exports.RFE_analysis=RFE_analysis;
exports.FScore_analysis=FScore_analysis;
