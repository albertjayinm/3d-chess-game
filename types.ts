import { Square } from 'chess.js';
import React from 'react';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface BoardPosition {
  type: PieceType;
  color: PieceColor;
}

export interface SelectedSquare {
  square: Square;
  validMoves: Square[];
}

export interface ThemeColors {
  light: string;
  dark: string;
  highlight: string;
  check: string;
  moveHint: string;
}

interface ThreeElements {
  ambientLight: any;
  pointLight: any;
  spotLight: any;
  group: any;
  mesh: any;
  meshStandardMaterial: any;
  meshBasicMaterial: any;
  cylinderGeometry: any;
  sphereGeometry: any;
  boxGeometry: any;
  torusGeometry: any;
  coneGeometry: any;
  ringGeometry: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
