import matplotlib.pyplot as plt
import numpy as np

def show_slice(image_slice, title="MRI Slice"):
    """
    Displays a 2D slice using matplotlib.
    """
    plt.figure(figsize=(6, 6))
    plt.imshow(image_slice, cmap="gray")
    plt.title(title)
    plt.axis("off")
    plt.tight_layout()
    plt.show()

def show_3d_brain(volume, spacing=(1.0, 1.0, 1.0)):
    """
    Shows a 3D volumetric preview.
    """
    try:
        import pyvista as pv
        grid = pv.ImageData()
        grid.dimensions = np.array(volume.shape)[::-1]
        grid.spacing = (spacing[2], spacing[1], spacing[0])
        grid.point_data["values"] = volume.flatten(order="C")
        plotter = pv.Plotter()
        plotter.add_volume(grid, scalars="values", opacity="sigmoid", shade=True)
        plotter.show()
    except Exception:
        print("Volume shape:", volume.shape, "Spacing:", spacing)
