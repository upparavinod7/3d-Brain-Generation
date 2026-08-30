import os
import numpy as np
import matplotlib.pyplot as plt
import pyvista as pv
from matplotlib.colors import LinearSegmentedColormap

# Custom brain anatomical colormap
BRAIN_COLORS = [
    (0.0, 0.0, 0.0),       # Background (black)
    (0.35, 0.1, 0.1),      # Dark tissue (reddish-brown)
    (0.75, 0.5, 0.5),      # Grey matter (fleshy pink/grey)
    (0.95, 0.88, 0.82),    # White matter (creamy beige)
    (1.0, 1.0, 1.0)        # Hyper-intense signal (white)
]
REAL_BRAIN_CMAP = LinearSegmentedColormap.from_list("real_brain", BRAIN_COLORS)

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

def plot_qualitative_comparison(gt_vol, reconstructions_dict, slice_idx=None, save_path="data/output/benchmark_comparison.png"):
    """
    Generates a qualitative comparison figure showing Ground Truth alongside all reconstruction methods.
    """
    if slice_idx is None:
        slice_idx = gt_vol.shape[0] // 2
        
    num_methods = len(reconstructions_dict) + 1
    cols = min(4, num_methods)
    rows = (num_methods + cols - 1) // cols
    
    fig, axes = plt.subplots(rows, cols, figsize=(3.5 * cols, 3.8 * rows))
    axes = np.array(axes).reshape(-1)
    
    # Subplot 0: Ground Truth
    axes[0].imshow(gt_vol[slice_idx], cmap="gray")
    axes[0].set_title("Ground Truth", fontsize=10, fontweight="bold", color="darkgreen")
    axes[0].axis("off")
    
    # Subplots 1..N: Reconstructions
    for idx, (name, vol) in enumerate(reconstructions_dict.items(), start=1):
        axes[idx].imshow(vol[slice_idx], cmap="gray")
        color = "darkblue" if "Proposed" in name else "black"
        axes[idx].set_title(name, fontsize=9, fontweight="bold" if "Proposed" in name else "normal", color=color)
        axes[idx].axis("off")
        
    for idx in range(num_methods, len(axes)):
        axes[idx].axis("off")
        
    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"[Visualizer] Qualitative slice comparison figure saved to {save_path}")

def show_3d_brain(volume, spacing=(1.0, 1.0, 1.0), title="3D Brain Volume", interactive=False, save_path="data/output/3d_brain_render.png"):
    """
    Renders 3D volume using PyVista.
    
    Parameters:
        volume (np.ndarray): 3D volume array (Z, Y, X).
        spacing (tuple): Voxel physical spacing (Z, Y, X) in mm.
        title (str): Window/Render title text.
        interactive (bool): If True, opens an interactive 3D GUI window for mouse manipulation.
        save_path (str): File path for saved screenshot.
    """
    grid = pv.ImageData()
    grid.dimensions = np.array(volume.shape)[::-1]  # (X, Y, Z)
    grid.spacing = (spacing[2], spacing[1], spacing[0])
    grid.point_data["values"] = volume.flatten(order="C")
    
    plotter = pv.Plotter(off_screen=not interactive)
    plotter.add_text(title, font_size=12)
    
    # Add Volume Rendering
    plotter.add_volume(grid, scalars="values", cmap=REAL_BRAIN_CMAP, opacity="sigmoid", shade=True)
    
    if interactive:
        print(f"\n[Visualizer] Launching Interactive 3D Viewer window for '{title}'...")
        print("  - Use LEFT MOUSE BUTTON to rotate the 3D brain volume.")
        print("  - Use RIGHT MOUSE BUTTON or MOUSE WHEEL to zoom in/out.")
        print("  - Use MIDDLE MOUSE BUTTON (or Shift + Left Click) to pan.")
        print("  - Press 'r' to reset camera, 'q' or Close window to exit.\n")
        plotter.show()
    else:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plotter.show(screenshot=save_path)
        print(f"[Visualizer] 3D Brain volume snapshot saved to {save_path}")

def show_interactive_orthogonal_slicer(volume, spacing=(1.0, 1.0, 1.0), title="Interactive 3D Brain Orthogonal Slicer"):
    """
    Launches an interactive PyVista Orthogonal Plane Slicer window.
    Allows user to drag 3 cross-sectional planes (Axial, Coronal, Sagittal) through the 3D brain.
    """
    grid = pv.ImageData()
    grid.dimensions = np.array(volume.shape)[::-1]
    grid.spacing = (spacing[2], spacing[1], spacing[0])
    grid.point_data["values"] = volume.flatten(order="C")
    
    plotter = pv.Plotter(off_screen=False)
    plotter.add_text(title, font_size=12)
    
    # Add interactive orthogonal slicing planes
    plotter.add_mesh_slice_orthogonal(grid, scalars="values", cmap="bone")
    
    print(f"\n[Visualizer] Launching Interactive Orthogonal Plane Slicer...")
    print("  - Drag plane outlines to cut through Axial, Coronal, and Sagittal slices.")
    print("  - Rotate/Zoom/Pan with mouse.")
    print("  - Press 'q' to close viewer.\n")
    plotter.show()

