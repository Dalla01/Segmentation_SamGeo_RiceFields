#import the libraries
import pandas as pd
import numpy as np
from scipy.signal import savgol_filter
import matplotlib.pyplot as plt
import os

# Set the path to your csv time series file (downloaded using GEE script)
dados = pd.read_csv('path/to/your/file.csv')

# Create a folder to save the png chart files
folder_path = 'charts'
if not os.path.exists(folder_path):
    os.makedirs(folder_path)

# Iteration over each unique ID
for id_unico in dados['ID'].unique():
    # Select data for current ID only
    dados_id = dados[dados['ID'] == id_unico]
    
    # Convert date column to datetime type
    dados_id['Data'] = pd.to_datetime(dados_id['Data'])
    
    # Sort data by date
    dados_id = dados_id.sort_values(by='Data')
    
    # Interpolate data to fill gaps
    dados_id['NDVI'] = dados_id['NDVI'].interpolate(method='linear')
    
    # Apply Savitzky-Golay for smoothing
    dados_id['NDVI_interp'] = savgol_filter(dados_id['NDVI'], window_length=5, polyorder=2)
    
    # Replace negative values with 0
    dados_id['NDVI_interp'] = np.where(dados_id['NDVI_interp'] < 0, 0, dados_id['NDVI_interp'])
    
    # Plot the time series for the current ID
    plt.figure(figsize=(10, 6))
    plt.plot(dados_id['Data'], dados_id['NDVI_interp'], label=f'ID_{id_unico}', color='red')
    plt.title(f'Times Series for segmented plot (ID {id_unico})', fontsize=20)
    plt.xlabel('Date', fontsize=18)
    plt.ylabel('NDVI', fontsize=18)
    plt.grid(False)
    plt.xticks(rotation=25, fontsize=18)  # Set x-axis ticks font size
    plt.yticks(fontsize=18)  # Set y-axis ticks font size
    plt.legend()
        
    # Save the chart as a PNG file
    file_name = f'chart_ID_{id_unico}.png'
    file_path = os.path.join(folder_path, file_name)
    plt.savefig(file_path)
    
    # Close the current graph to free up memory
    plt.close()

print("Charts successfully saved in 'charts' folder.")
