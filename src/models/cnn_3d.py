import torch
import torch.nn as nn

class SRCNN3D(nn.Module):
    """
    Phase 10: 3D Super-Resolution Convolutional Neural Network (3D-SRCNN)
    Uses 3D convolutions with residual learning to reconstruct fine spatial details.
    """
    def __init__(self, in_channels=1, hidden_dim=32):
        super(SRCNN3D, self).__init__()
        
        self.feature_extractor = nn.Sequential(
            nn.Conv3d(in_channels, hidden_dim, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv3d(hidden_dim, hidden_dim, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )
        
        self.reconstructor = nn.Conv3d(hidden_dim, in_channels, kernel_size=3, padding=1)
        
    def forward(self, x):
        # x shape: (B, C, Z, Y, X)
        residual = self.feature_extractor(x)
        out = self.reconstructor(residual)
        # Residual skip connection
        return torch.clamp(x + out, 0.0, 1.0)
