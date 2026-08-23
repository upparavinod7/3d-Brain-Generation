import torch
import torch.nn as nn

class ResBlock3D(nn.Module):
    """
    3D Residual Block for spatial volumetric feature extraction.
    """
    def __init__(self, channels):
        super(ResBlock3D, self).__init__()
        self.conv1 = nn.Conv3d(channels, channels, kernel_size=3, padding=1)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv3d(channels, channels, kernel_size=3, padding=1)

    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.relu(out)
        out = self.conv2(out)
        out = out + residual
        return self.relu(out)


class TrilinearCNNRefinement3D(nn.Module):
    """
    Phase A: Lightweight 3D Residual CNN for Trilinear MRI Refinement.
    
    Mathematical Formulation:
        Input:  V_tri  (Trilinear interpolated initial 3D volume)
        Output: V_final = clamp(V_tri + F_CNN(V_tri; Theta), 0.0, 1.0)
        
    The network predicts a spatial residual correction map R = F_CNN(V_tri)
    to restore high-frequency anatomical edge details lost during trilinear smoothing.
    """
    def __init__(self, in_channels=1, base_channels=32, num_blocks=2):
        super(TrilinearCNNRefinement3D, self).__init__()
        
        self.entry_conv = nn.Sequential(
            nn.Conv3d(in_channels, base_channels, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )
        
        blocks = [ResBlock3D(base_channels) for _ in range(num_blocks)]
        self.res_blocks = nn.Sequential(*blocks)
        
        self.exit_conv = nn.Conv3d(base_channels, in_channels, kernel_size=3, padding=1)
        
    def forward(self, x):
        """
        Forward pass.
        
        Parameters:
            x (torch.Tensor): Tensor of shape (Batch, 1, Z, Y, X)
            
        Returns:
            torch.Tensor: Refined volume of shape (Batch, 1, Z, Y, X)
        """
        feats = self.entry_conv(x)
        feats = self.res_blocks(feats)
        residual = self.exit_conv(feats)
        
        # Residual Skip Connection to initial Trilinear Volume
        refined = x + residual
        return torch.clamp(refined, 0.0, 1.0)

if __name__ == "__main__":
    model = TrilinearCNNRefinement3D(base_channels=32, num_blocks=2)
    dummy_input = torch.rand(1, 1, 24, 64, 64)
    out = model(dummy_input)
    print(f"Model successfully initialized.")
    print(f"Input shape:  {dummy_input.shape}")
    print(f"Output shape: {out.shape}")
    num_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Trainable Parameters: {num_params:,}")
