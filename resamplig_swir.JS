var ten_m_prj = nir_band.first() //Access the first image of the collection
						.projection() // Get all information about projection needed for resample SWIR bands to 10m
function resampling (img){
	var swir = img.select("B11") // and "B12" for the other swir bands
	var swir_ten_m = swir.resample('bilinear')
						.reproject(ten_m_prj) // Apply reprojection based onthe NIR band informations
	return swir_ten_m
}

// To use the function over all imagens in a collection
s2_resamp_imageCollection = s2_imageCollection.map(resampling)	
