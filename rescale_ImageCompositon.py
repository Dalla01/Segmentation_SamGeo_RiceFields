#Install packeges
!pip install rasterio

#import the libraries
import rasterio
import numpy as np
import os

def rescale_image(image):
    rescaled_bands = []

    # Iterate over each band
    for band in range(image.shape[0]):
        band_data = image[band, :, :]

        # Calculate the 2nd and 98th percentiles
        percentile_2 = np.percentile(band_data, 2)
        percentile_98 = np.percentile(band_data, 98)

        # Rescale the band based on percentiles
        rescaled_band = np.interp(
            band_data,
            (percentile_2, percentile_98),
            (0, 255)
        ).clip(0, 255).astype(np.uint8)

        rescaled_bands.append(rescaled_band)

    # Combine rescaled bands into an array
    rescaled_image = np.stack(rescaled_bands, axis=0)

    return rescaled_image

# Open the GeoTIFF file using rasterio

image_path = 'your/input/image/path.tif'
with rasterio.open(image_path) as src:
    # Read the image data
    image = src.read()

    # Rescale the image
    rescaled_image = rescale_image(image)

# Get the folder path
folder_path = os.path.dirname(image_path)

output_folder = 'your/output/folder/'

# Prepare the output file path
output_path = os.path.join(output_folder, 'set_the_name_of_rescaled_image.tif')

# Create a new GeoTIFF file for the rescaled image
with rasterio.open(
    output_path,
    'w',
    driver='GTiff',
    height=rescaled_image.shape[1],
    width=rescaled_image.shape[2],
    count=rescaled_image.shape[0],
    dtype=rescaled_image.dtype,
    crs=src.crs,
    transform=src.transform,
) as dst:
    dst.write(rescaled_image)

print('Rescaled image exported successfully.')
