import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      torusGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}
