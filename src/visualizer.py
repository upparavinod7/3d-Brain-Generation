import matplotlib.pyplot as plt
import pyvista as pv
import numpy as np

def show_slice(image_slice, title="MRI Slice"):
    """
    Visualizes a single 2D slice using Matplotlib.
    """
    plt.imshow(image_slice, cmap="gray")
    plt.title(title)
    plt.axis("off")
    plt.show()

def show_3d_brain(volume, spacing=(1.0, 1.0, 1.0)):
    """
    Module 7: Visualization Module
    
    Uses PyVista to render the 3D reconstructed volume.
    Allows for rotating and inspecting the final 3D brain.
    """
    print("Preparing 3D visualization...")
    
    z_sp, y_sp, x_sp = spacing
    
    # Create a PyVista grid from the 3D NumPy array using standard mapping
    grid = pv.ImageData()
    grid.dimensions = np.array(volume.shape)[::-1] # (X, Y, Z)
    grid.spacing = (x_sp, y_sp, z_sp) # Set physical proportions
    
    # Flatten using C order (default for NumPy)
    grid.point_data["values"] = volume.flatten(order="C")
    
    # Create the plotter
    plotter = pv.Plotter()
    
    # Create a custom colormap for a "real brain" fleshy look
    # Transitions from black (background) -> dark red -> pinkish-grey -> creamy white
    from matplotlib.colors import LinearSegmentedColormap
    brain_colors = [
        (0.0, 0.0, 0.0),       # Background (black)
        (0.4, 0.1, 0.1),       # Dark tissue (deep reddish-brown)
        (0.8, 0.5, 0.5),       # Grey matter (fleshy pink/grey)
        (0.95, 0.85, 0.8),     # White matter (creamy beige)
        (1.0, 1.0, 1.0)        # Hyper-intense (white)
    ]
    brain_cmap = LinearSegmentedColormap.from_list("real_brain", brain_colors)
    
    # Add volume rendering. We use 'sigmoid' opacity, which is perfect for medical imaging. 
    # It suppresses background noise completely and highlights brain tissue.
    plotter.add_volume(grid, scalars="values", cmap=brain_cmap, opacity="sigmoid", shade=True)

    plotter.add_text("Proposed: Trilinear Interpolation + Image Enhancement (Hybrid)", font_size=11)
    
    print("Opening 3D Viewer...")
    plotter.show()
