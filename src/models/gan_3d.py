import torch
import torch.nn as nn

class Generator3D(nn.Module):
    """
    Phase 11 & 12: 3D GAN Generator Network
    Takes an initial interpolated 3D volume (e.g. Trilinear) and refines high-frequency anatomical details.
    """
    def __init__(self, in_channels=1, hidden_dim=32):
        super(Generator3D, self).__init__()
        
        self.encoder = nn.Sequential(
            nn.Conv3d(in_channels, hidden_dim, kernel_size=3, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv3d(hidden_dim, hidden_dim * 2, kernel_size=3, padding=1),
            nn.BatchNorm3d(hidden_dim * 2),
            nn.LeakyReLU(0.2, inplace=True)
        )
        
        self.decoder = nn.Sequential(
            nn.Conv3d(hidden_dim * 2, hidden_dim, kernel_size=3, padding=1),
            nn.BatchNorm3d(hidden_dim),
            nn.ReLU(inplace=True),
            nn.Conv3d(hidden_dim, in_channels, kernel_size=3, padding=1)
        )
        
    def forward(self, x):
        features = self.encoder(x)
        refinement = self.decoder(features)
        # Residual output
        out = x + refinement
        return torch.clamp(out, 0.0, 1.0)


class Discriminator3D(nn.Module):
    """
    3D PatchGAN Discriminator Network
    Evaluates local 3D volume patches to distinguish between real ground-truth MRI volumes
    and synthetic reconstructed volumes.
    """
    def __init__(self, in_channels=1, hidden_dim=16):
        super(Discriminator3D, self).__init__()
        
        self.model = nn.Sequential(
            nn.Conv3d(in_channels, hidden_dim, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv3d(hidden_dim, hidden_dim * 2, kernel_size=4, stride=2, padding=1),
            nn.BatchNorm3d(hidden_dim * 2),
            nn.LeakyReLU(0.2, inplace=True),
            
            nn.Conv3d(hidden_dim * 2, 1, kernel_size=3, padding=1),
            nn.Sigmoid()
        )
        
    def forward(self, x):
        return self.model(x)
